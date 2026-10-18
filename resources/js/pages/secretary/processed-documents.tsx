import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, Search, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type ProcessedRequest = {
    id: number;
    status: "processing" | "ready" | "claimed" | "rejected";
    identity_status: "pending" | "verified" | "rejected";
    payment_method: string;
    payment_status: string;
    payment_receipt_url: string | null;
    created_at: string;
    identity_document_url: string | null;
    identity_document_back_url: string | null;
    requester_details: {
        first_name: string | null;
        middle_name: string | null;
        surname: string | null;
        birthdate: string | null;
        address: string | null;
        zone: string | null;
        sex: string | null;
        contact_number: string | null;
    };
    resident: { name: string; email: string };
    document_type: { name: string; fee: string | number };
};

type PaginatedRequests = {
    data: ProcessedRequest[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type Props = {
    search: string;
    summary: {
        totalProcessed: number;
        processing: number;
        readyToClaim: number;
        claimed: number;
        rejected: number;
    };
    requests: PaginatedRequests;
};

export default function ProcessedDocumentsPage({ summary, requests, search: serverSearch }: Props) {
    const [search, setSearch] = useState(serverSearch);

    useEffect(() => {
        if (search === serverSearch) return;

        const timeout = window.setTimeout(() => {
            router.get(
                "/secretary/processed-documents",
                { search: search || undefined },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 300);

        return () => window.clearTimeout(timeout);
    }, [search, serverSearch]);

    return (
        <>
            <Head title="Processed Documents Reports" />
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
                    <h1 className="mt-1 text-3xl font-black">Processed documents reports</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Review document requests that have moved beyond pending, including their
                        processing status and requester records.
                    </p>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <SummaryCard
                        icon={FileText}
                        label="Processed requests"
                        value={summary.totalProcessed}
                    />
                    <SummaryCard icon={Clock3} label="Processing" value={summary.processing} />
                    <SummaryCard
                        icon={CheckCircle2}
                        label="Ready to claim"
                        value={summary.readyToClaim}
                    />
                    <SummaryCard
                        icon={XCircle}
                        label="Claimed / rejected"
                        value={`${summary.claimed} / ${summary.rejected}`}
                    />
                </section>

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
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800">
                                <tr>
                                    {[
                                        "Requester",
                                        "Document",
                                        "Status",
                                        "Payment",
                                        "ID images",
                                        "Submitted",
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
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {requests.data.map((request) => (
                                    <tr key={request.id} className="align-top">
                                        <td className="px-4 py-4">
                                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                {fullName(request.requester_details) ||
                                                    request.resident.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {request.requester_details.contact_number}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                {request.requester_details.address}, Zone{" "}
                                                {request.requester_details.zone}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {request.resident.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {request.document_type.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                                Request #{request.id}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize dark:bg-slate-800 dark:text-slate-200">
                                                {request.identity_status === "rejected" &&
                                                request.status !== "claimed"
                                                    ? "rejected"
                                                    : request.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium text-slate-900 uppercase dark:text-slate-100">
                                                {request.payment_method}
                                            </p>
                                            <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                                                {request.payment_status}
                                            </p>
                                            {request.payment_receipt_url && (
                                                <PaymentReceiptPreviewDialog
                                                    url={request.payment_receipt_url}
                                                    requestId={request.id}
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            {request.identity_document_url ? (
                                                <IdentityPreviewDialog
                                                    url={request.identity_document_url}
                                                    requestId={request.id}
                                                    sideLabel="Front of ID"
                                                />
                                            ) : (
                                                <span className="text-slate-500 dark:text-slate-400">
                                                    Not available
                                                </span>
                                            )}
                                            {request.identity_document_back_url && (
                                                <IdentityPreviewDialog
                                                    url={request.identity_document_back_url}
                                                    requestId={request.id}
                                                    sideLabel="Back of ID"
                                                />
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                            {formatDate(request.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center">
                            <h2 className="font-bold">No processed documents yet</h2>
                            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                Requests appear in this report after they leave pending status.
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

function SummaryCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FileText;
    label: string;
    value: number | string;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-emerald-600" />
                <span className="text-2xl font-black">{value}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

function IdentityPreviewDialog({
    url,
    requestId,
    sideLabel,
}: {
    url: string;
    requestId: number;
    sideLabel: string;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="mt-2 block break-words text-left text-xs font-semibold text-emerald-700 underline"
                >
                    View ID {sideLabel === "Front of ID" ? "front" : "back"}
                </button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-5xl">
                
                <iframe
                    src={url}
                    title={`${sideLabel} preview for request ${requestId}`}
                    className="h-[70vh] w-full rounded-md border border-slate-200 bg-slate-50 dark:border-slate-700"
                />
            </DialogContent>
        </Dialog>
    );
}

function PaymentReceiptPreviewDialog({
    url,
    requestId,
}: {
    url: string;
    requestId: number;
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="mt-2 block break-words text-left text-xs font-semibold text-emerald-700 underline"
                >
                    View GCash receipt
                </button>
            </DialogTrigger>
            <DialogContent className="w-[calc(100%-2rem)] max-w-5xl">

                <div className="flex h-[70vh] w-full items-center justify-center overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-950">
                    <img
                        src={url}
                        alt={`GCash receipt for request ${requestId}`}
                        className="max-h-full max-w-full object-contain"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

function fullName(details: ProcessedRequest["requester_details"]): string {
    return [details.first_name, details.middle_name, details.surname].filter(Boolean).join(" ");
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
