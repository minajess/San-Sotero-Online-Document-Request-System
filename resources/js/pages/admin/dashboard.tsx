import { Head, Link, usePage } from "@inertiajs/react";
import {
    BarChart3,
    Bell,
    ClipboardList,
    FileText,
    Settings,
    ShieldCheck,
    Users,
    UserCog,
    ChevronRight,
} from "lucide-react";

type User = {
    name: string;
    email: string;
    role: string;
};

type Statistics = {
    totalUsers: number;
    totalResidents: number;
    totalStaff: number;
    totalRequests: number;
    completedRequests: number;
};

type RecentUser = {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
};

type PageProps = {
    user: User;
    statistics: Statistics;
    recentActivity: RecentUser[];
};

export default function AdminDashboard() {
    const { user, statistics, recentActivity } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Super Admin Dashboard" />

            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
                {/* Header */}
                <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex h-16 items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/brgyLogo.png"
                                alt="Barangay San Sotero"
                                className="h-11 w-11 rounded-full border-2 border-emerald-100 object-cover dark:border-emerald-900"
                            />

                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Barangay San Sotero
                                </p>

                                <h1 className="font-bold text-slate-900 dark:text-white">
                                    Document Request System
                                </h1>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/admin/requests"
                                className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            >
                                <Bell className="h-5 w-5" />

                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                            </Link>

                            <div className="hidden border-l border-slate-200 pl-4 dark:border-slate-700 sm:block">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    {user?.name ?? "Super Administrator"}
                                </p>

                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Super Administrator
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="w-full py-8">
                    {/* Welcome */}
                    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 p-7 text-white shadow-sm">
                        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                            <div>
                                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    System Administration
                                </div>

                                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                                    Welcome, {user?.name ?? "Super Administrator"}!
                                </h2>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50">
                                    Manage the San Sotero Online Barangay Document Request System,
                                    users, document services, and requests from one place.
                                </p>
                            </div>

                            <div className="hidden rounded-2xl border border-white/10 bg-white/10 p-5 lg:block">
                                <ShieldCheck className="h-10 w-10 text-white" />
                            </div>
                        </div>
                    </section>

                    {/* System Overview */}
                    <section className="mt-8">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                System Overview
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Live statistics from the barangay system.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                icon={Users}
                                title="Total Users"
                                value={statistics.totalUsers}
                                description="Registered system users"
                            />

                            <StatCard
                                icon={Users}
                                title="Residents"
                                value={statistics.totalResidents}
                                description="Registered residents"
                            />

                            <StatCard
                                icon={UserCog}
                                title="Staff"
                                value={statistics.totalStaff}
                                description="Administrators and secretaries"
                            />

                            <StatCard
                                icon={ClipboardList}
                                title="Requests"
                                value={statistics.totalRequests}
                                description="Total document requests"
                            />
                        </div>
                    </section>

                    {/* Management */}
                    <section className="mt-8">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                System Management
                            </h2>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Manage the different parts of the application.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            <ManagementCard
                                icon={Users}
                                title="User Management"
                                description="Manage resident, secretary, and administrator accounts."
                                href="/admin/users"
                            />

                            <ManagementCard
                                icon={UserCog}
                                title="Barangay Staff"
                                description="Manage barangay secretaries and authorized personnel."
                                href="/admin/staff"
                            />

                            <ManagementCard
                                icon={FileText}
                                title="Document Services"
                                description="Manage available document types, fees, and requirements."
                                href="/admin/document-types"
                            />

                            <ManagementCard
                                icon={ClipboardList}
                                title="Document Requests"
                                description="View and monitor all resident document requests."
                                href="/admin/requests"
                            />

                            <ManagementCard
                                icon={BarChart3}
                                title="Reports"
                                description="View system activity and document request statistics."
                                href="/admin/reports"
                            />

                            <ManagementCard
                                icon={Settings}
                                title="System Settings"
                                description="Configure application and barangay system settings."
                                href="/admin/settings"
                            />

                            <ManagementCard
                                icon={FileText}
                                title="Landing Page"
                                description="Edit the public website content, images, links, and section order."
                                href="/admin/landing-page"
                            />
                        </div>
                    </section>

                    {/* Activity */}
                    <section className="mt-8">
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white">
                                        Recent Activity
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Latest registered users and system activity.
                                    </p>
                                </div>

                                <Link
                                    href="/admin/users"
                                    className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                >
                                    View All
                                </Link>
                            </div>

                            <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
                                {recentActivity.length > 0 ? (
                                    recentActivity.map((activity) => (
                                        <ActivityRow
                                            key={activity.id}
                                            name={activity.name}
                                            email={activity.email}
                                            role={activity.role}
                                            createdAt={activity.created_at}
                                        />
                                    ))
                                ) : (
                                    <div className="py-10 text-center">
                                        <Users className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-700" />

                                        <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            No recent activity
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            New user activity will appear here.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Statistics Card
|--------------------------------------------------------------------------
*/

function StatCard({
    icon: Icon,
    title,
    value,
    description,
}: {
    icon: typeof Users;
    title: string;
    value: number;
    description: string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                    <Icon className="h-5 w-5" />
                </div>

                <span className="text-2xl font-black text-slate-900 dark:text-white">{value}</span>
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{description}</p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Management Card
|--------------------------------------------------------------------------
*/

function ManagementCard({
    icon: Icon,
    title,
    description,
    href,
}: {
    icon: typeof Users;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-400 dark:group-hover:bg-emerald-600 dark:group-hover:text-white">
                <Icon className="h-6 w-6" />
            </div>

            <h2 className="mt-5 font-bold text-slate-900 dark:text-white">{title}</h2>

            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {description}
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Manage
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
        </Link>
    );
}

/*
|--------------------------------------------------------------------------
| Activity Row
|--------------------------------------------------------------------------
*/

function ActivityRow({
    name,
    email,
    role,
    createdAt,
}: {
    name: string;
    email: string;
    role: string;
    createdAt: string;
}) {
    const initials = name
        .split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const roleLabel =
        role === "super_admin"
            ? "Super Administrator"
            : role === "secretary"
              ? "Barangay Secretary"
              : "Resident";

    const roleClasses =
        role === "super_admin"
            ? "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
            : role === "secretary"
              ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
              : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

    return (
        <div className="flex items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {initials}
                </div>

                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {name}
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{email}</p>
                </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-1">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleClasses}`}>
                    {roleLabel}
                </span>

                <span className="text-[11px] text-slate-400">{formatDate(createdAt)}</span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Quick Link
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
*/

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
