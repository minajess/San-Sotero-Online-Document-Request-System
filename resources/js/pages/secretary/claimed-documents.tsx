import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, ClipboardCheck, Printer, Search, X } from "lucide-react";
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

type MonthlyReport = {
    month: string;
    month_label: string;
    categories: {
        type: string;
        total: number;
        records: {
            resident_name: string;
            contact_number: string | null;
            email: string;
            address: string | null;
            claimed_at: string | null;
            payment: string;
        }[];
    }[];
    total: number;
    barangay_name: string;
    logo_image: string;
};

export default function ClaimedDocumentsPage({
    requests,
    search: serverSearch,
    report,
}: {
    requests: PaginatedRequests;
    search: string;
    report: MonthlyReport;
}) {
    const [search, setSearch] = useState(serverSearch);
    const [month, setMonth] = useState(report.month);
    const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);

    useEffect(() => {
        if (search === serverSearch) return;

        const timeout = window.setTimeout(() => {
            router.get(
                "/secretary/claimed-documents",
                { search: search || undefined, month },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, serverSearch, month]);

    useEffect(() => setMonth(report.month), [report.month]);

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

                    <h1 className="mt-1 text-3xl font-black">Claimed document records</h1>

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

                <section className="space-y-4 border-y border-slate-200 py-5 dark:border-slate-800">
                    <form
                        className="no-print flex flex-wrap items-end gap-3"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                "/secretary/claimed-documents",
                                { search: search || undefined, month },
                                {
                                    preserveState: true,
                                    preserveScroll: true,
                                    replace: true,
                                    onSuccess: () => setIsReportPreviewOpen(true),
                                },
                            );
                        }}
                    >
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Report month
                            <input
                                type="month"
                                value={month}
                                onChange={(event) => {
                                    const selectedMonth = event.target.value;
                                    setMonth(selectedMonth);

                                    if (!selectedMonth) return;

                                    router.get(
                                        "/secretary/claimed-documents",
                                        {
                                            search: search || undefined,
                                            month: selectedMonth,
                                        },
                                        {
                                            preserveState: true,
                                            preserveScroll: true,
                                            replace: true,
                                        },
                                    );
                                }}
                                required
                                className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                        </label>
                        <button
                            type="submit"
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                        >
                            Preview Report
                        </button>
                    </form>

                    {isReportPreviewOpen && (
                        <div
                            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 p-4 sm:p-8"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="monthly-report-dialog-title"
                        >
                            <div className="mx-auto max-w-4xl rounded-lg bg-white p-5 shadow-xl sm:p-8">
                                <div className="no-print mb-5 flex items-center justify-between gap-4">
                                    <h2
                                        id="monthly-report-dialog-title"
                                        className="text-lg font-bold text-slate-900"
                                    >
                                        Report preview
                                    </h2>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                                        >
                                            <Printer aria-hidden="true" className="h-4 w-4" />
                                            Print Report
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Close report preview"
                                            onClick={() => setIsReportPreviewOpen(false)}
                                            className="rounded-lg border border-slate-300 p-2 text-slate-700 hover:bg-slate-50"
                                        >
                                            <X aria-hidden="true" className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                    <article id="monthly-claimed-report" className="bg-white text-slate-900">
                        <header className="flex items-center gap-4 border-b-2 border-emerald-800 pb-4">
                            <img
                                src={report.logo_image}
                                alt=""
                                className="h-16 w-16 object-contain"
                            />
                            <div>
                                <h2 className="text-xl font-bold">{report.barangay_name}</h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Monthly Claimed Document Report
                                </p>
                                <p className="text-sm font-semibold">{report.month_label}</p>
                            </div>
                        </header>

                        {report.categories.length > 0 ? (
                            <div className="mt-5 space-y-6">
                                {report.categories.map((category) => (
                                    <section key={category.type} className="report-category">
                                        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                                            <h3 className="font-bold">{category.type}</h3>
                                            <p className="text-sm font-semibold">
                                                Subtotal: {category.total}
                                            </p>
                                        </div>
                                        <table className="report-data-table mt-2 w-full table-fixed text-left text-xs">
                                            <thead>
                                                <tr className="text-xs uppercase text-slate-600">
                                                    <th className="w-[34%] py-2 pr-2">Resident</th>
                                                    <th className="w-[30%] py-2 pr-2">Address</th>
                                                    <th className="w-[20%] py-2 pr-2">Date claimed</th>
                                                    <th className="w-[16%] py-2">Payment</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {category.records.map((record, index) => (
                                                    <tr
                                                        key={`${record.resident_name}-${record.claimed_at}-${index}`}
                                                        className="border-t border-slate-200"
                                                    >
                                                        <td className="py-2 pr-2">
                                                            <span className="block font-semibold">{record.resident_name}</span>
                                                            <span className="mt-1 block text-slate-600">
                                                                {record.contact_number || "—"}
                                                            </span>
                                                            <span className="block text-slate-600">{record.email}</span>
                                                        </td>
                                                        <td className="py-2 pr-2">{record.address || "—"}</td>
                                                        <td className="py-2 pr-2">
                                                            {record.claimed_at
                                                                ? formatDate(record.claimed_at)
                                                                : "Not recorded"}
                                                        </td>
                                                        <td className="py-2 uppercase">{record.payment}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </section>
                                ))}
                            </div>
                        ) : (
                            <p className="py-8 text-center text-sm text-slate-600">
                                No documents were claimed during this month.
                            </p>
                        )}

                        <footer className="mt-6 border-t-2 border-emerald-800 pt-3 text-right font-bold">
                            Overall total: {report.total}
                        </footer>
                    </article>
                            </div>
                        </div>
                    )}
                </section>

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
            <style>{`
                @page {
                    size: A4 portrait;
                    margin: 16mm;
                    @bottom-right {
                        content: "Page " counter(page) " of " counter(pages);
                        font-size: 9pt;
                        color: #475569;
                    }
                }
                @media print {
                    body * { visibility: hidden !important; }
                    #monthly-claimed-report,
                    #monthly-claimed-report * { visibility: visible !important; }
                    #monthly-claimed-report {
                        position: absolute;
                        inset: 0 auto auto 0;
                        width: 100%;
                        color: #0f172a !important;
                        background: #fff !important;
                        font-size: 10pt;
                        print-color-adjust: exact;
                    }
                    .no-print { display: none !important; }
                    .report-category { break-inside: avoid; page-break-inside: avoid; }
                    #monthly-claimed-report table { break-inside: auto; }
                    #monthly-claimed-report tr { break-inside: avoid; page-break-inside: avoid; }
                    #monthly-claimed-report th,
                    #monthly-claimed-report td { overflow-wrap: anywhere; vertical-align: top; }
                }
            `}</style>
        </>
    );
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
