import { useForm } from "@inertiajs/react";
import { useState } from "react";
import { Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export type DocumentRequestRow = {
    id: number;
    purpose: string;
    status: string;
    payment_method: "cash" | "gcash";
    payment_status: "unpaid" | "paid";
    payment_receipt_url?: string | null;
    identity_status: "pending" | "verified" | "rejected";
    identity_status_locked: boolean;
    identity_document_url?: string | null;
    identity_document_back_url?: string | null;
    requester_details?: {
        first_name: string | null;
        middle_name: string | null;
        surname: string | null;
        birthdate: string | null;
        address: string | null;
        zone: string | null;
        sex: string | null;
        contact_number: string | null;
    };
    first_name?: string | null;
    middle_name?: string | null;
    surname?: string | null;
    ready_at: string | null;
    claimed_at?: string | null;
    claimed_by_name?: string | null;
    created_at: string;
    resident?: {
        name: string;
        email: string;
    };
    document_type: {
        name: string;
        fee: string | number;
    };
};

export default function DocumentRequestTable({
    requests,
    canProcess = false,
    showRequesterSearch = true,
}: {
    requests: DocumentRequestRow[];
    canProcess?: boolean;
    showRequesterSearch?: boolean;
}) {
    const [search, setSearch] = useState("");
    const searchTerms = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const filteredRequests = requests.filter((request) => {
        const requesterName = [
            request.requester_details?.first_name,
            request.requester_details?.middle_name,
            request.requester_details?.surname,
            request.first_name,
            request.middle_name,
            request.surname,
            request.claimed_by_name,
            request.resident?.name,
        ]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase();

        return searchTerms.every((term) => requesterName.includes(term));
    });

    return (
        <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            {showRequesterSearch && (
                <div className="border-b border-slate-200 p-3 dark:border-slate-800">
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
                </div>
            )}
            {filteredRequests.length === 0 ? (
                <div className="p-10 text-center">
                    <h2 className="font-bold text-slate-900 dark:text-slate-100">
                        {requests.length === 0
                            ? "No document requests yet"
                            : "No requests match that requester name"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {requests.length === 0
                            ? "New requests will appear here when a resident submits one."
                            : "Try another name or clear the search."}
                    </p>
                </div>
            ) : (
            <table
                className={`w-full table-fixed text-left text-xs sm:text-sm ${
                    canProcess ? "min-w-[1200px]" : "min-w-[1000px]"
                }`}
            >
                <colgroup>
                    {canProcess ? (
                        <>
                            <col className="w-[16%]" />
                            <col className="w-[10%]" />
                            <col className="w-[9%]" />
                            <col className="w-[12%]" />
                            <col className="w-[11%]" />
                            <col className="w-[14%]" />
                            <col className="w-[10%]" />
                            <col className="w-[18%]" />
                        </>
                    ) : (
                        <>
                            <col className="w-[19%]" />
                            <col className="w-[13%]" />
                            <col className="w-[13%]" />
                            <col className="w-[11%]" />
                            <col className="w-[12%]" />
                            <col className="w-[16%]" />
                            <col className="w-[16%]" />
                        </>
                    )}
                </colgroup>
                <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                        {[
                            "Resident",
                            "Document",
                            "Purpose",
                            "ID verification",
                            "Submitted",
                            "Status",
                            "Payment",
                            ...(canProcess ? ["Process"] : []),
                        ].map((heading) => (
                            <th
                                key={heading}
                                className="whitespace-nowrap px-1.5 py-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300 sm:px-2 sm:text-xs lg:px-3 lg:text-sm"
                            >
                                {heading}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredRequests.map((request) => (
                        <tr key={request.id} className="align-top">
                            <td className="break-words px-2 py-3 text-slate-900 dark:text-slate-100 sm:px-3 lg:px-4 lg:py-4">
                                <p className="font-semibold">{request.resident?.name ?? "You"}</p>
                                {request.resident?.email && (
                                    <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">
                                        {request.resident.email}
                                    </p>
                                )}
                                {request.requester_details && (
                                    <div className="mt-2 space-y-1 break-words text-xs text-slate-600 dark:text-slate-300">
                                        <p>
                                            {[
                                                request.requester_details.first_name,
                                                request.requester_details.middle_name,
                                                request.requester_details.surname,
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                        </p>
                                        <p>{request.requester_details.contact_number}</p>
                                        <p>
                                            {request.requester_details.address}
                                            {request.requester_details.address &&
                                            request.requester_details.zone
                                                ? " · "
                                                : ""}
                                            {request.requester_details.zone
                                                ? `Zone ${request.requester_details.zone}`
                                                : ""}
                                        </p>
                                        <p>
                                            {request.requester_details.sex}
                                            {request.requester_details.birthdate
                                                ? ` · ${formatBirthdate(request.requester_details.birthdate)}`
                                                : ""}
                                        </p>
                                    </div>
                                )}
                            </td>
                            <td className="break-words px-2 py-3 text-slate-900 dark:text-slate-100 sm:px-3 lg:px-4 lg:py-4">
                                <p className="font-medium">{request.document_type.name}</p>
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Fee: {formatFee(request.document_type.fee)}
                                </p>
                            </td>
                            <td className="break-words whitespace-normal px-2 py-3 text-slate-600 dark:text-slate-300 sm:px-3 lg:px-4 lg:py-4">
                                {request.purpose}
                            </td>
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <IdentityBadge status={request.identity_status} />
                                {request.identity_document_url && (
                                    <IdentityPreviewDialog
                                        url={request.identity_document_url}
                                        requestId={request.id}
                                        sideLabel="Front of ID"
                                    />
                                )}
                                {request.identity_document_back_url && (
                                    <IdentityPreviewDialog
                                        url={request.identity_document_back_url}
                                        requestId={request.id}
                                        sideLabel="Back of ID"
                                    />
                                )}
                            </td>
                            <td className="break-words px-2 py-3 text-slate-500 dark:text-slate-400 sm:px-3 lg:px-4 lg:py-4">
                                {formatDate(request.created_at)}
                            </td>
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <StatusBadge
                                    status={
                                        request.identity_status === "rejected" &&
                                        request.status !== "claimed"
                                            ? "rejected"
                                            : request.status
                                    }
                                />
                                {request.status === "claimed" && (
                                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                                        {request.claimed_at && (
                                            <p>{formatDate(request.claimed_at)}</p>
                                        )}
                                        {request.claimed_by_name && (
                                            <p className="mt-1 break-words text-slate-500 dark:text-slate-400">
                                                Claimed by {request.claimed_by_name}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </td>
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <p className="font-medium uppercase">{request.payment_method}</p>
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
                            {canProcess && (
                                <td className="min-w-0 px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                    <RequestActions request={request} />
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            )}
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

function RequestActions({ request }: { request: DocumentRequestRow }) {
    const isIdentityRejected = request.identity_status === "rejected";
    const isFinalized =
        request.status === "claimed" || request.status === "rejected" || isIdentityRejected;
    const [readySubmitted, setReadySubmitted] = useState(false);
    const identityForm = useForm({
        identity_status: request.identity_status,
    });
    const readyForm = useForm({
        status: "ready",
        payment_status: request.payment_status,
        identity_status: request.identity_status,
    });
    const paymentForm = useForm({
        payment_status: "paid" as const,
    });
    const claimForm = useForm({
        status: "",
        payment_status: "",
        identity_status: "",
    });

    const markReady = () => {
        setReadySubmitted(true);
        readyForm.transform(() => ({
            status: "ready",
            payment_status: request.payment_status,
            identity_status: identityForm.data.identity_status,
        }));
        readyForm.patch(`/secretary/requests/${request.id}`, {
            preserveScroll: true,
            onError: () => setReadySubmitted(false),
            onHttpException: () => setReadySubmitted(false),
            onNetworkError: () => setReadySubmitted(false),
        });
    };

    const claimDocument = () => {
        claimForm.post(`/secretary/requests/${request.id}/claim`, {
            preserveScroll: true,
        });
    };

    const markPaid = () => {
        paymentForm.patch(`/secretary/requests/${request.id}/payment`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-2">
            <div className="grid min-w-0 grid-cols-2 gap-2">
                <label className="block min-w-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                    ID verification
                    <select
                        value={
                            identityForm.data.identity_status === "pending" &&
                            !request.identity_status_locked
                                ? ""
                                : identityForm.data.identity_status
                        }
                        disabled={isFinalized || request.identity_status_locked}
                        onChange={(event) => {
                            const identityStatus = event.target.value as
                                | "pending"
                                | "verified"
                                | "rejected";
                            identityForm.transform(() => ({
                                status: request.status,
                                payment_status: request.payment_status,
                                identity_status: identityStatus,
                            }));
                            identityForm.patch(`/secretary/requests/${request.id}`, {
                                preserveScroll: true,
                                onSuccess: () =>
                                    identityForm.setData("identity_status", identityStatus),
                            });
                        }}
                        className="mt-1 min-w-0 w-full max-w-full rounded-lg border border-slate-300 bg-white px-1.5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                    >
                        {request.identity_status_locked &&
                            identityForm.data.identity_status === "pending" && (
                                <option value="pending" disabled>
                                    Pending (locked)
                                </option>
                            )}
                        <option value="" disabled>
                            Choose status
                        </option>
                        <option value="verified">Verified</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </label>
                {identityForm.errors.identity_status && (
                    <p className="col-span-2 text-xs text-red-600">
                        {identityForm.errors.identity_status}
                    </p>
                )}
                {!isIdentityRejected &&
                    (request.status === "pending" || request.status === "processing") && (
                    <div className="col-span-2">
                        <button
                            type="button"
                            onClick={markReady}
                            disabled={
                                readyForm.processing ||
                                readySubmitted ||
                                identityForm.data.identity_status !== "verified" ||
                                (request.payment_method === "gcash" &&
                                    request.payment_status !== "paid")
                            }
                            className="w-full rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {readyForm.processing || readySubmitted
                                ? "Updating…"
                                : "Ready to claim"}
                        </button>
                        {readyForm.errors.status && (
                            <p className="mt-1 text-xs text-red-600">{readyForm.errors.status}</p>
                        )}
                        {readyForm.errors.identity_status && (
                            <p className="mt-1 text-xs text-red-600">
                                {readyForm.errors.identity_status}
                            </p>
                        )}
                    </div>
                )}
                {!isIdentityRejected && (
                    <>
                        <div className="col-span-2">
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                Payment status
                            </p>
                            <button
                                type="button"
                                onClick={markPaid}
                                disabled={
                                    isFinalized ||
                                    identityForm.data.identity_status !== "verified" ||
                                    (request.payment_method === "cash" &&
                                        request.status !== "ready") ||
                                    request.payment_status === "paid" ||
                                    (request.payment_method === "gcash" &&
                                        !request.payment_receipt_url) ||
                                    paymentForm.processing
                                }
                                className="mt-1 w-full rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                            >
                                {paymentForm.processing
                                    ? "Updating…"
                                    : request.payment_status === "paid"
                                      ? "Paid"
                                      : request.payment_method === "gcash"
                                        ? "Mark as Paid"
                                        : "Mark as paid"}
                            </button>
                        </div>
                        {paymentForm.errors.payment_status && (
                            <p className="col-span-2 text-xs text-red-600">
                                {paymentForm.errors.payment_status}
                            </p>
                        )}
                    </>
                )}
            </div>
            {!isIdentityRejected &&
                request.status === "ready" &&
                request.payment_method !== "cash" && (
                <div className="space-y-1 border-t border-slate-200 pt-2 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={claimDocument}
                        disabled={
                            claimForm.processing ||
                            request.payment_status !== "paid" ||
                            request.identity_status !== "verified"
                        }
                        className="w-full rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {claimForm.processing ? "Recording claim…" : "Mark as claimed"}
                    </button>
                    {request.payment_status !== "paid" && (
                        <p className="text-xs text-amber-700">
                            Record payment before marking this document as claimed.
                        </p>
                    )}
                    {claimForm.errors.status && (
                        <p className="text-xs text-red-600">{claimForm.errors.status}</p>
                    )}
                    {claimForm.errors.payment_status && (
                        <p className="text-xs text-red-600">{claimForm.errors.payment_status}</p>
                    )}
                    {claimForm.errors.identity_status && (
                        <p className="text-xs text-red-600">{claimForm.errors.identity_status}</p>
                    )}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        pending: "bg-amber-100 text-amber-800",
        processing: "bg-blue-100 text-blue-800",
        ready: "bg-emerald-100 text-emerald-800",
        rejected: "bg-rose-100 text-rose-800",
        claimed: "bg-slate-200 text-slate-800",
    };

    return (
        <span
            className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-center text-xs leading-tight font-semibold ${classes[status] ?? classes.pending}`}
        >
            {statusLabel(status)}
        </span>
    );
}

function IdentityBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        pending: "bg-amber-100 text-amber-800",
        verified: "bg-emerald-100 text-emerald-800",
        rejected: "bg-rose-100 text-rose-800",
    };

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${classes[status] ?? classes.pending}`}
        >
            {status === "pending"
                ? "Needs review"
                : status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

export function statusLabel(status: string): string {
    if (status === "ready") {
        return "Ready to Claim";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function formatDate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

function formatBirthdate(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
    }).format(new Date(value));
}

function formatFee(fee: string | number): string {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(fee));
}
