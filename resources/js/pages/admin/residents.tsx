import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import UserMonitorTable, {
    type MonitoredUser,
} from '@/components/user-monitor-table';

export default function ResidentsPage({ users }: { users: MonitoredUser[] }) {
    return (
        <>
            <Head title="Residents" />
            <div className="w-full min-w-0 space-y-6">
                <div>
                    <Link
                        href="/admin/dashboard"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Admin dashboard
                    </Link>
                    <h1 className="text-3xl font-black">Residents</h1>
                    <p className="mt-2 text-slate-500">
                        Registered San Sotero residents and their request
                        activity.
                    </p>
                </div>
                <UserMonitorTable users={users} />
            </div>
        </>
    );
}
