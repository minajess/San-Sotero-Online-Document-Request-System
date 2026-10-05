import { useForm } from "@inertiajs/react";
import type { FormEvent } from "react";

export type DocumentRequestRow = {
    id: number;
    purpose: string;
    status: string;
    payment_method: "cash" | "gcash";
    payment_status: "unpaid" | "paid";
    payment_reference: string | null;
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
    ready_at: string | null;
    claimed_at?: string | null;
    claimed_by_name?: string | null;
    ready_at_input?: string;
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
}: {
    requests: DocumentRequestRow[];
    canProcess?: boolean;
}) {
    if (requests.length === 0) {
        return (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
                <h2 className="font-bold">No document requests yet</h2>
                <p className="mt-2 text-sm text-slate-500">
                    New requests will appear here when a resident submits one.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full table-fixed text-left text-xs sm:text-sm">
                <colgroup>
                    {canProcess ? (
                        <>
                            <col className="w-[15%]" />
                            <col className="w-[9%]" />
                            <col className="w-[8%]" />
                            <col className="w-[10%]" />
                            <col className="w-[9%]" />
                            <col className="w-[7%]" />
                            <col className="w-[11%]" />
                            <col className="w-[9%]" />
                            <col className="w-[22%]" />
                        </>
                    ) : (
                        <>
                            <col className="w-[17%]" />
                            <col className="w-[12%]" />
                            <col className="w-[12%]" />
                            <col className="w-[9%]" />
                            <col className="w-[11%]" />
                            <col className="w-[9%]" />
                            <col className="w-[15%]" />
                            <col className="w-[15%]" />
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
                            "Claim time",
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
                    {requests.map((request) => (
                        <tr key={request.id} className="align-top">
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <p className="font-semibold">{request.resident?.name ?? "You"}</p>
                                {request.resident?.email && (
                                    <p className="mt-1 break-all text-xs text-slate-500">
                                        {request.resident.email}
                                    </p>
                                )}
                                {request.requester_details && (
                                    <div className="mt-2 space-y-1 break-words text-xs text-slate-600">
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
                                                ? ` · ${formatDate(request.requester_details.birthdate)}`
                                                : ""}
                                        </p>
                                    </div>
                                )}
                            </td>
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <p className="font-medium">{request.document_type.name}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                    Fee: {formatFee(request.document_type.fee)}
                                </p>
                            </td>
                            <td className="break-words whitespace-normal px-2 py-3 text-slate-600 dark:text-slate-300 sm:px-3 lg:px-4 lg:py-4">
                                {request.purpose}
                            </td>
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <IdentityBadge status={request.identity_status} />
                                {request.identity_document_url && (
                                    <a
                                        href={request.identity_document_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 block break-words text-xs font-semibold text-emerald-700 underline"
                                    >
                                        View ID front
                                    </a>
                                )}
                                {request.identity_document_back_url && (
                                    <a
                                        href={request.identity_document_back_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-1 block break-words text-xs font-semibold text-emerald-700 underline"
                                    >
                                        View ID back
                                    </a>
                                )}
                            </td>
                            <td className="break-words px-2 py-3 text-slate-500 sm:px-3 lg:px-4 lg:py-4">
                                {formatDate(request.created_at)}
                            </td>
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <StatusBadge status={request.status} />
                            </td>
                            <td className="break-words px-2 py-3 text-slate-600 dark:text-slate-300 sm:px-3 lg:px-4 lg:py-4">
                                {request.status === "claimed" ? (
                                    <div>
                                        <p className="font-medium text-emerald-700">
                                            Claimed
                                            {request.claimed_at
                                                ? ` · ${formatDate(request.claimed_at)}`
                                                : ""}
                                        </p>
                                        {request.claimed_by_name && (
                                            <p className="mt-1 break-words text-xs text-slate-500">
                                                Claimed by {request.claimed_by_name}
                                            </p>
                                        )}
                                    </div>
                                ) : request.ready_at ? (
                                    formatDate(request.ready_at)
                                ) : (
                                    "Not scheduled"
                                )}
                            </td>
                            <td className="break-words px-2 py-3 sm:px-3 lg:px-4 lg:py-4">
                                <p className="font-medium uppercase">{request.payment_method}</p>
                                <p className="mt-1 text-xs capitalize text-slate-500">
                                    {request.payment_status}
                                </p>
                                {request.payment_reference && (
                                    <p className="mt-1 break-words text-xs text-slate-500">
                                        Ref: {request.payment_reference}
                                    </p>
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
        </div>
    );
}

function RequestActions({ request }: { request: DocumentRequestRow }) {
    const isFinalized = request.status === "claimed" || request.status === "rejected";
    const lockMessage =
        request.status === "claimed"
            ? "Claim recorded. Processing details are locked."
            : "Request rejected. Processing details are locked.";
    const form = useForm({
        status: request.status,
        ready_at: request.ready_at_input ?? "",
        payment_status: request.payment_status,
        identity_status: request.identity_status,
    });
    const claimForm = useForm({
        status: "",
        payment_status: "",
        identity_status: "",
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/secretary/requests/${request.id}`, {
            preserveScroll: true,
        });
    };

    const claimDocument = () => {
        claimForm.post(`/secretary/requests/${request.id}/claim`, {
            preserveScroll: true,
        });
    };

    const nextStatuses: Record<string, string[]> = {
        pending: ["pending", "processing", "rejected"],
        processing: ["processing", "ready", "rejected"],
        ready: ["ready"],
        claimed: ["claimed"],
        rejected: ["rejected"],
    };

    return (
        <div className="space-y-2">
            <form onSubmit={submit} className="grid min-w-0 grid-cols-2 gap-2">
                <label className="block min-w-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                    ID verification
                    <select
                        value={
                            form.data.identity_status === "pending" &&
                            !request.identity_status_locked
                                ? ""
                                : form.data.identity_status
                        }
                        disabled={isFinalized || request.identity_status_locked}
                        onChange={(event) =>
                            form.setData(
                                "identity_status",
                                event.target.value as "pending" | "verified" | "rejected",
                            )
                        }
                        className="mt-1 min-w-0 w-full max-w-full rounded-lg border border-slate-300 bg-white px-1.5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                    >
                        {request.identity_status_locked &&
                            form.data.identity_status === "pending" && (
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
                    {request.identity_status_locked && (
                        <span className="mt-1 block text-[10px] font-normal text-slate-500 sm:text-xs">
                            Saved and locked
                        </span>
                    )}
                </label>
                {form.errors.identity_status && (
                    <p className="col-span-2 text-xs text-red-600">{form.errors.identity_status}</p>
                )}
                <label className="block min-w-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Status
                    <select
                        value={form.data.status}
                        disabled={isFinalized}
                        onChange={(event) => form.setData("status", event.target.value)}
                        className="mt-1 min-w-0 w-full max-w-full rounded-lg border border-slate-300 bg-white px-1.5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                    >
                        {(nextStatuses[request.status] ?? [request.status]).map((status) => (
                            <option key={status} value={status}>
                                {statusLabel(status)}
                            </option>
                        ))}
                    </select>
                </label>
                <label className="col-span-2 block min-w-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Claim date and time
                    <input
                        type="datetime-local"
                        value={form.data.ready_at}
                        disabled={isFinalized}
                        onChange={(event) => form.setData("ready_at", event.target.value)}
                        className="mt-1 min-w-0 w-full max-w-full rounded-lg border border-slate-300 bg-white px-1 py-2 text-[11px] disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                    />
                </label>
                {form.errors.ready_at && (
                    <p className="col-span-2 text-xs text-red-600">{form.errors.ready_at}</p>
                )}
                <label className="block min-w-0 text-xs font-medium text-slate-600 dark:text-slate-300">
                    Payment status
                    <select
                        value={form.data.payment_status}
                        disabled={isFinalized || request.payment_status === "paid"}
                        onChange={(event) =>
                            form.setData("payment_status", event.target.value as "paid" | "unpaid")
                        }
                        className="mt-1 min-w-0 w-full max-w-full rounded-lg border border-slate-300 bg-white px-1.5 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                    >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                    </select>
                </label>
                {request.payment_status === "paid" && (
                    <p className="col-span-2 text-xs text-emerald-700 dark:text-emerald-400">
                        Payment is locked as paid and cannot be changed.
                    </p>
                )}
                {isFinalized && (
                    <p className="col-span-2 text-xs font-medium text-slate-500">
                        {lockMessage}
                    </p>
                )}
                {form.errors.status && (
                    <p className="col-span-2 text-xs text-red-600">{form.errors.status}</p>
                )}
                {form.errors.payment_status && (
                    <p className="col-span-2 text-xs text-red-600">{form.errors.payment_status}</p>
                )}
                <button
                    type="submit"
                    disabled={form.processing || isFinalized}
                    className="col-span-2 w-full self-end rounded-lg bg-emerald-600 px-2 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                >
                    {form.processing ? "Saving…" : "Save update"}
                </button>
            </form>
            {request.status === "ready" && (
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
            className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${classes[status] ?? classes.pending}`}
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

function formatFee(fee: string | number): string {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(fee));
}
