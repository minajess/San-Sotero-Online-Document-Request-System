import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Activity,
    CheckCircle2,
    Clock3,
    FileText,
    Users,
} from 'lucide-react';

type ActivityEntry = {
    id: number;
    event: string;
    description: string;
    created_at: string;
    actor_name: string | null;
    actor_role: string | null;
    actor: {
        name: string;
        role: string;
    } | null;
};

type ActivityPage = {
    data: ActivityEntry[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Summary = {
    totalActivities: number;
    totalRequests: number;
    pendingRequests: number;
    processingRequests: number;
    readyToClaim: number;
    claimedRequests: number;
    totalResidents: number;
};

export default function ActivityReport({
    roleLabel,
    backHref,
    summary,
    activities,
}: {
    roleLabel: string;
    backHref: string;
    summary: Summary;
    activities: ActivityPage;
}) {
    return (
        <div className="min-h-screen bg-slate-50 p-4 text-slate-900 md:p-6 dark:bg-slate-950 dark:text-white">
            <main className="mx-auto w-full max-w-none">
                <Link
                    href={backHref}
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <header className="mb-6">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {roleLabel}
                    </p>
                    <h1 className="mt-1 text-3xl font-black">
                        Activity
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        System activity and current document request statistics.
                    </p>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        icon={Activity}
                        title="Recorded activities"
                        value={summary.totalActivities}
                    />
                    <SummaryCard
                        icon={FileText}
                        title="Total requests"
                        value={summary.totalRequests}
                    />
                    <SummaryCard
                        icon={Clock3}
                        title="Pending / processing"
                        value={`${summary.pendingRequests} / ${summary.processingRequests}`}
                    />
                    <SummaryCard
                        icon={CheckCircle2}
                        title="Ready / claimed"
                        value={`${summary.readyToClaim} / ${summary.claimedRequests}`}
                    />
                </section>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Registered residents:{' '}
                        <span className="font-bold text-slate-900 dark:text-white">
                            {summary.totalResidents}
                        </span>
                    </p>
                </div>

                <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="border-b border-slate-200 p-5 dark:border-slate-800">
                        <h2 className="font-bold">Activity history</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Includes request submissions, ID verification,
                            payment and status changes, and administrator
                            management actions.
                        </p>
                    </div>

                    {activities.data.length > 0 ? (
                        <>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {activities.data.map((entry) => (
                                    <article
                                        key={entry.id}
                                        className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
                                    >
                                        <div className="flex gap-3">
                                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                                <Activity className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <p className="font-semibold">
                                                    {entry.description}
                                                </p>
                                                <span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                    {entry.event.replace(
                                                        /[._]/g,
                                                        ' ',
                                                    )}
                                                </span>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {entry.actor?.name ??
                                                        entry.actor_name ??
                                                        'System'}
                                                    {(entry.actor?.role ??
                                                        entry.actor_role) && (
                                                        <span className="capitalize">
                                                            {' '}
                                                            ·{' '}
                                                            {(
                                                                entry.actor
                                                                    ?.role ??
                                                                entry.actor_role ??
                                                                ''
                                                            ).replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <time
                                            dateTime={entry.created_at}
                                            className="shrink-0 text-sm text-slate-500 dark:text-slate-400 sm:text-right"
                                        >
                                            {formatDate(entry.created_at)}
                                        </time>
                                    </article>
                                ))}
                            </div>
                            <footer className="flex flex-col gap-3 border-t border-slate-200 p-5 text-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                                <p className="text-slate-500">
                                    Showing {activities.from ?? 0}–
                                    {activities.to ?? 0} of {activities.total}{' '}
                                    activities
                                </p>
                                <div className="flex gap-2">
                                    <PaginationLink
                                        href={activities.prev_page_url}
                                        disabled={!activities.prev_page_url}
                                    >
                                        Previous
                                    </PaginationLink>
                                    <span className="px-3 py-2 text-slate-500">
                                        Page {activities.current_page} of{' '}
                                        {activities.last_page}
                                    </span>
                                    <PaginationLink
                                        href={activities.next_page_url}
                                        disabled={!activities.next_page_url}
                                    >
                                        Next
                                    </PaginationLink>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="p-10 text-center">
                            <Activity className="mx-auto h-8 w-8 text-slate-400" />
                            <p className="mt-3 font-semibold">
                                No activities recorded yet
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                New system activity will appear here.
                            </p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

function SummaryCard({
    icon: Icon,
    title,
    value,
}: {
    icon: typeof FileText;
    title: string;
    value: number | string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
                <Icon className="h-5 w-5 shrink-0 text-emerald-600" />
            </div>
            <p className="mt-3 text-2xl font-black">{value}</p>
        </div>
    );
}

function PaginationLink({
    href,
    disabled,
    children,
}: {
    href: string | null;
    disabled: boolean;
    children: string;
}) {
    if (disabled || !href) {
        return (
            <span className="rounded-lg border border-slate-200 px-3 py-2 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                {children}
            </span>
        );
    }

    return (
        <Link
            href={href}
            className="rounded-lg border border-slate-300 px-3 py-2 font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
        >
            {children}
        </Link>
    );
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}
