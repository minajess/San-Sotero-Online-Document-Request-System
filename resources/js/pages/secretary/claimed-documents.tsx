import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, ClipboardCheck } from "lucide-react";

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

export default function ClaimedDocumentsPage({ requests }: { requests: PaginatedRequests }) {
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
                    <p className="mt-2 text-slate-500">
                        Records show the requester name and date and time each paid document was
                        claimed.
                    </p>
                </header>

                <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                    {requests.data.length > 0 ? (
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-slate-50">
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
                                            className="px-4 py-3 font-semibold text-slate-600"
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
                                            <p className="font-semibold">
                                                {request.claimed_by_name || request.resident.name}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {request.resident.email}
                                            </p>
                                        </td>
                                        <td className="px-4 py-4 font-medium">
                                            {request.document_type.name}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-slate-600">
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
                            <p className="mt-2 text-sm text-slate-500">
                                Completed claims will appear here after the secretary records them.
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

function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}
