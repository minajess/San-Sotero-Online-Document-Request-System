import { useState } from 'react';
import { Search, Users } from 'lucide-react';

export type MonitoredUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    document_requests_count: number;
};

export default function UserMonitorTable({
    users,
}: {
    users: MonitoredUser[];
}) {
    const [search, setSearch] = useState('');
    const filteredUsers = users.filter((user) =>
        `${user.name} ${user.email} ${user.role}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    return (
        <>
            <label className="relative mb-5 block">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, email, or role"
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pr-4 pl-10 text-sm dark:border-slate-700 dark:bg-slate-900"
                />
            </label>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                        <tr>
                            <th className="px-5 py-4">Name</th>
                            <th className="px-5 py-4">Email</th>
                            <th className="px-5 py-4">Role</th>
                            <th className="px-5 py-4">Requests</th>
                            <th className="px-5 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td className="px-5 py-4 font-semibold">
                                    {user.name}
                                </td>
                                <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                                    {user.email}
                                </td>
                                <td className="px-5 py-4">
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 capitalize dark:bg-emerald-950 dark:text-emerald-300">
                                        {user.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    {user.document_requests_count}
                                </td>
                                <td className="px-5 py-4 text-slate-500">
                                    {new Intl.DateTimeFormat(undefined, {
                                        dateStyle: 'medium',
                                    }).format(new Date(user.created_at))}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="p-10 text-center text-sm text-slate-500">
                        <Users className="mx-auto mb-3 h-7 w-7 text-slate-400" />
                        {users.length === 0
                            ? 'No users have registered yet.'
                            : 'No users match your search.'}
                    </div>
                )}
            </div>
            <p className="mt-3 text-sm text-slate-500">
                Showing {filteredUsers.length} of {users.length} account
                {users.length === 1 ? '' : 's'}.
            </p>
        </>
    );
}
