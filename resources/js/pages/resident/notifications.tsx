import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, Bell, Check, Eye } from "lucide-react";
import { useState } from "react";

type Notification = {
    id: string;
    title: string;
    message: string;
    created_at: string | null;
    read_at: string | null;
};

export default function ResidentNotifications({
    notifications,
    unreadNotificationsCount,
}: {
    notifications: Notification[];
    unreadNotificationsCount: number;
}) {
    const [openNotificationId, setOpenNotificationId] = useState<string | null>(null);

    const openNotification = (notification: Notification) => {
        const isOpening = openNotificationId !== notification.id;
        setOpenNotificationId(isOpening ? notification.id : null);

        if (isOpening && !notification.read_at) {
            router.patch(
                `/resident/notifications/${encodeURIComponent(notification.id)}/read`,
                {},
                { preserveScroll: true, preserveState: true },
            );
        }
    };

    return (
        <>
            <Head title="Notifications" />
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <header className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link
                            href="/resident/dashboard"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to dashboard
                        </Link>
                        <h1 className="mt-4 text-3xl font-black text-slate-900">
                            All notifications
                        </h1>
                        <p className="mt-2 text-slate-500">
                            Select a notification to view its details. Opening it marks it as read.
                        </p>
                    </div>
                    {unreadNotificationsCount > 0 && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                            {unreadNotificationsCount} unread
                        </span>
                    )}
                </header>

                {notifications.length > 0 ? (
                    <div className="space-y-3">
                        {notifications.map((notification) => {
                            const isOpen = openNotificationId === notification.id;
                            const isUnread = !notification.read_at;

                            return (
                                <article
                                    key={notification.id}
                                    className={`overflow-hidden rounded-2xl border ${
                                        isUnread
                                            ? "border-emerald-200 bg-emerald-50/70"
                                            : "border-slate-200 bg-white"
                                    }`}
                                >
                                    <button
                                        type="button"
                                        aria-expanded={isOpen}
                                        onClick={() => openNotification(notification)}
                                        className="flex w-full items-start gap-3 p-4 text-left hover:bg-black/[0.02]"
                                    >
                                        <span className="mt-0.5 rounded-lg bg-white p-2 text-emerald-700">
                                            {isUnread ? (
                                                <Bell className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex flex-wrap items-center gap-2">
                                                <span className="font-semibold text-slate-900">
                                                    {notification.title}
                                                </span>
                                                {isUnread ? (
                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                                                        New
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                                        <Check className="h-3.5 w-3.5" />
                                                        Read
                                                    </span>
                                                )}
                                            </span>
                                            {notification.created_at && (
                                                <time
                                                    dateTime={notification.created_at}
                                                    className="mt-1 block text-xs text-slate-500"
                                                >
                                                    {formatNotificationDate(
                                                        notification.created_at,
                                                    )}
                                                </time>
                                            )}
                                        </span>
                                        <span className="text-xs font-semibold text-emerald-700">
                                            {isOpen ? "Close" : "Open"}
                                        </span>
                                    </button>
                                    {isOpen && (
                                        <div className="border-t border-slate-200 px-4 py-4 pl-14 text-sm text-slate-700">
                                            {notification.message || "No additional details."}
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                        <Bell className="mx-auto h-7 w-7 text-slate-400" />
                        <p className="mt-3 font-semibold text-slate-700">No notifications yet</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Updates about your document requests will appear here.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

function formatNotificationDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
