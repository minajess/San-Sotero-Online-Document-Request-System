import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, CheckCircle2, Clock3, FileText, XCircle } from "lucide-react";

type ProcessedRequest = {
    id: number;
    status: "processing" | "ready" | "claimed" | "rejected";
    payment_method: string;
    payment_status: string;
    ready_at: string | null;
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
    summary: {
        totalProcessed: number;
        processing: number;
        readyToClaim: number;
        claimed: number;
        rejected: number;
    };
    requests: PaginatedRequests;
};

export default function ProcessedDocumentsPage({ summary, requests }: Props) {
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
                    <p className="mt-2 text-slate-500">
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

                <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    {requests.data.length > 0 ? (
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    {[
                                        "Requester",
                                        "Document",
                                        "Status",
                                        "Claim schedule",
                                        "Payment",
                                        "ID images",
                                        "Submitted",
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            className="px-4 py-3 font-semibold text-slate-600"
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requests.data.map((request) => (
                                    <tr key={request.id} className="align-top">
                                        <td className="px-4 py-4">
                                            <p className="font-semibold">
                                                {fullName(request.requester_details) ||
                                                    request.resident.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {request.requester_details.contact_number}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {request.requester_details.address}, Zone{" "}
                                                {request.requester_details.zone}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {request.resident.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium">
                                                {request.document_type.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Request #{request.id}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize">
                                                {request.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-slate-600">
                                            {request.ready_at
                                                ? formatDate(request.ready_at)
                                                : "Not scheduled"}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="font-medium uppercase">
                                                {request.payment_method}
                                            </p>
                                            <p className="mt-1 text-xs capitalize text-slate-500">
                                                {request.payment_status}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {request.identity_document_url ? (
                                                <a
                                                    className="block font-semibold text-emerald-700 underline"
                                                    href={request.identity_document_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Front of ID
                                                </a>
                                            ) : (
                                                <span className="text-slate-500">
                                                    Not available
                                                </span>
                                            )}
                                            {request.identity_document_back_url && (
                                                <a
                                                    className="mt-1 block font-semibold text-emerald-700 underline"
                                                    href={request.identity_document_back_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
                                                    Back of ID
                                                </a>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-slate-500">
                                            {formatDate(request.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-10 text-center">
                            <h2 className="font-bold">No processed documents yet</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Requests appear in this report after they leave pending status.
                            </p>
                        </div>
                    )}
                    {requests.total > 0 && (
                        <footer className="flex items-center justify-between border-t border-slate-200 p-4 text-sm">
                            <span className="text-slate-500">
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
                                    <span className="rounded-lg border px-3 py-2 text-slate-400">
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
                                    <span className="rounded-lg border px-3 py-2 text-slate-400">
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
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-emerald-600" />
                <span className="text-2xl font-black">{value}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
        </div>
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
