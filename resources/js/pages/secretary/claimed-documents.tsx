import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, ClipboardCheck, Search } from "lucide-react";
import { useEffect, useState } from "react";

type ClaimedRequest = {
    id: number;
    claimed_by_name: string | null;
    claimed_at: string | null;
    payment_method: string;
    resident: { name: string; email: string };
    document_type: { name: string };
};

type PaginatedRequests = {
    data: ClaimedRequest[];
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function ClaimedDocumentsPage({
    requests,
    search: serverSearch,
}: {
    requests: PaginatedRequests;
    search: string;
}) {
    const [search, setSearch] = useState(serverSearch);

    useEffect(() => {
        if (search === serverSearch) return;

        const timeout = window.setTimeout(() => {
            router.get(
                "/secretary/claimed-documents",
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, serverSearch]);

    return (
        <>
            <Head title="Claimed Document Records" />
            <main className="mx-auto w-full max-w-none space-y-6">
                <Link
                    href="/secretary/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>

                <header>
                    <p className="text-sm font-semibold text-emerald-700">Barangay Secretary</p>
                    <h1 className="mt-1 text-3xl font-black">Claimed document records</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Records show the requester name and date and time each paid document was
                        claimed.
                    </p>
                </header>

                <label className="block max-w-md text-sm font-medium text-slate-700 dark:text-slate-300">
                    Search requester name
                    <div className="relative mt-1">
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                        />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Enter requester name"
                            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-10 font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                    </div>
                </label>

                <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {requests.data.length > 0 ? (
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    {[
                                        "Claimant",
                                        "Document",
                                        "Claimed date and time",
                                        "Payment",
                                        "Request #",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.data.map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-4 py-4">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                {request.claimed_by_name || request.resident.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {request.resident.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 font-medium text-slate-900 dark:text-slate-100">
                                            {request.document_type.name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                            {request.claimed_at
                                                ? formatDate(request.claimed_at)
                                                : "Time not recorded"}
                                        </td>
                                        <td className="px-4 py-4 uppercase">
                                            {request.payment_method}
                                        </td>
                                        <td className="px-4 py-4">#{request.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center">
                            <ClipboardCheck className="mx-auto h-8 w-8 text-slate-400" />
                            <h2 className="mt-3 font-bold">No claimed documents recorded yet</h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Completed claims will appear here after the secretary records them.
                            </p>
                        </div>
                    )}
                    {requests.total > 0 && (
                        <footer className="flex items-center justify-between border-t border-slate-200 p-4 text-sm dark:border-slate-800">
                            <span className="text-slate-500 dark:text-slate-400">
                                Showing {requests.from}–{requests.to} of {requests.total}
                            </span>
                            <div className="flex gap-2">
                                {requests.prev_page_url ? (
                                    <Link
                                        className="rounded-lg border px-3 py-2"
                                        href={requests.prev_page_url}
                                    >
                                        Previous
                                    </Link>
                                ) : (
                                    <span className="rounded-lg border border-slate-300 px-3 py-2 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                        Previous
                                    </span>
                                )}
                                {requests.next_page_url ? (
                                    <Link
                                        className="rounded-lg border px-3 py-2"
                                        href={requests.next_page_url}
                                    >
                                        Next
                                    </Link>
                                ) : (
                                    <span className="rounded-lg border border-slate-300 px-3 py-2 text-slate-400 dark:border-slate-700 dark:text-slate-500">
                                        Next
                                    </span>
                                )}
                            </div>
                        </footer>
                    )}
                </section>
            </main>
        </>
    );
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
