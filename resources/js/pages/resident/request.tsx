import { Head, Link, useForm } from "@inertiajs/react";
import { AlertTriangle, ArrowLeft, FileText, ImagePlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

type DocumentTypeOption = {
    id: number;
    name: string;
    description: string | null;
    fee: string | number;
};

type ResidentDetails = {
    first_name: string | null;
    middle_name: string | null;
    surname: string | null;
    birthdate: string | null;
    address: string | null;
    zone: string | null;
    sex: string | null;
    contact_number: string | null;
};

export default function CreateDocumentRequest({
    documentTypes,
    resident,
    gcashPayment,
}: {
    documentTypes: DocumentTypeOption[];
    resident: ResidentDetails;
    gcashPayment: {
        gcash_number: string | null;
        qr_code_url: string | null;
        configured: boolean;
    };
}) {
    const middleNameNotApplicable = !resident.middle_name;
    const form = useForm<{
        document_type_id: number | "";
        purpose: string;
        payment_method: "cash" | "gcash" | "";
        payment_receipt: File | null;
        contact_number: string;
        first_name: string;
        middle_name: string;
        middle_name_na: boolean;
        surname: string;
        birthdate: string;
        address: string;
        zone: string;
        sex: string;
        id_document_front: File | null;
        id_document_back: File | null;
        id_is_valid: boolean;
    }>({
        document_type_id: "",
        purpose: "",
        payment_method: "",
        payment_receipt: null,
        contact_number: resident.contact_number ?? "",
        first_name: resident.first_name ?? "",
        middle_name: resident.middle_name ?? "",
        middle_name_na: middleNameNotApplicable,
        surname: resident.surname ?? "",
        birthdate: resident.birthdate?.slice(0, 10) ?? "",
        address: resident.address ?? "",
        zone: resident.zone ?? "",
        sex: resident.sex ?? "",
        id_document_front: null,
        id_document_back: null,
        id_is_valid: false,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post("/resident/requests");
    };

    return (
        <>
            <Head title="Request a Document" />
            <div className="mx-auto w-full max-w-7xl space-y-6">
                <div>
                    <Link
                        href="/resident/dashboard"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <h1 className="text-3xl font-black">Request a document</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Complete the details below. The barangay secretary will review your request.
                    </p>
                </div>

                <form
                    onSubmit={submit}
                    className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm lg:p-8 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm font-semibold">
                            Document type
                            <select
                                required
                                value={form.data.document_type_id}
                                onChange={(event) =>
                                    form.setData(
                                        "document_type_id",
                                        event.target.value ? Number(event.target.value) : "",
                                    )
                                }
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            >
                                <option value="">Choose a document</option>
                                {documentTypes.map((document) => (
                                    <option key={document.id} value={document.id}>
                                        {document.name} — {formatFee(document.fee)}
                                    </option>
                                ))}
                            </select>
                            {form.errors.document_type_id && (
                                <span className="mt-1 block text-sm text-red-600">
                                    {form.errors.document_type_id}
                                </span>
                            )}
                        </label>

                        <label className="block text-sm font-semibold">
                            Purpose of request
                            <textarea
                                required
                                maxLength={2000}
                                rows={2}
                                value={form.data.purpose}
                                onChange={(event) => form.setData("purpose", event.target.value)}
                                placeholder="Tell us what you need this document for."
                                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                            {form.errors.purpose && (
                                <span className="mt-1 block text-sm text-red-600">
                                    {form.errors.purpose}
                                </span>
                            )}
                        </label>
                    </div>

                    <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <legend className="px-1 text-sm font-semibold">
                            Your personal details
                        </legend>
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <RequestField
                                label="First name"
                                value={form.data.first_name}
                                onChange={(value) => form.setData("first_name", value)}
                                error={form.errors.first_name}
                            />
                            <RequestField
                                label="Surname"
                                value={form.data.surname}
                                onChange={(value) => form.setData("surname", value)}
                                error={form.errors.surname}
                            />
                            <div>
                                <RequestField
                                    label="Middle name"
                                    value={form.data.middle_name}
                                    onChange={(value) => form.setData("middle_name", value)}
                                    error={form.errors.middle_name}
                                    required={!form.data.middle_name_na}
                                    disabled={form.data.middle_name_na}
                                />
                                <label className="mt-2 flex items-center gap-2 text-sm font-normal text-slate-600 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={form.data.middle_name_na}
                                        onChange={(event) => {
                                            const notApplicable = event.target.checked;
                                            form.setData("middle_name_na", notApplicable);
                                            if (notApplicable) form.setData("middle_name", "");
                                        }}
                                        className="rounded border-slate-300 text-emerald-600"
                                    />
                                    N/A — no middle name
                                </label>
                            </div>
                            <RequestField
                                label="Birthdate"
                                type="date"
                                value={form.data.birthdate}
                                onChange={(value) => form.setData("birthdate", value)}
                                error={form.errors.birthdate}
                                max={new Date().toISOString().slice(0, 10)}
                            />
                            <RequestField
                                label="Address"
                                value={form.data.address}
                                onChange={(value) => form.setData("address", value)}
                                error={form.errors.address}
                            />
                            <RequestField
                                label="Zone"
                                value={form.data.zone}
                                onChange={(value) => form.setData("zone", value)}
                                error={form.errors.zone}
                            />
                            <label className="block text-sm font-semibold">
                                Sex
                                <select
                                    required
                                    value={form.data.sex}
                                    onChange={(event) => form.setData("sex", event.target.value)}
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                                >
                                    <option value="" disabled>
                                        Select sex
                                    </option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                                {form.errors.sex && <FieldError message={form.errors.sex} />}
                            </label>
                            <RequestField
                                label="Contact number"
                                type="tel"
                                value={form.data.contact_number}
                                onChange={(value) => form.setData("contact_number", value)}
                                error={form.errors.contact_number}
                                placeholder="09XXXXXXXXX"
                                pattern="(?:09\d{9}|\+639\d{9}|639\d{9})"
                            />
                        </div>
                    </fieldset>

                    <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                        <legend className="px-1 text-sm font-semibold">
                            Government-issued ID images
                        </legend>
                        <div
                            role="alert"
                            className="flex gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900"
                        >
                            <AlertTriangle className="h-5 w-5 shrink-0" />
                            <p>
                                Upload clear pictures of the{" "}
                                <strong>front and back of your actual government-issued ID</strong>.
                                Images that are not an ID, are unreadable, or do not show both sides
                                may be rejected by the secretary.
                            </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <IdImageField
                                label="Front of ID"
                                name="id_document_front"
                                file={form.data.id_document_front}
                                error={form.errors.id_document_front}
                                onChange={(file) => form.setData("id_document_front", file)}
                            />
                            <IdImageField
                                label="Back of ID"
                                name="id_document_back"
                                file={form.data.id_document_back}
                                error={form.errors.id_document_back}
                                onChange={(file) => form.setData("id_document_back", file)}
                            />
                        </div>
                        <label className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <input
                                required
                                type="checkbox"
                                disabled={
                                    !form.data.id_document_front ||
                                    !form.data.id_document_back
                                }
                                checked={form.data.id_is_valid}
                                onChange={(event) =>
                                    form.setData("id_is_valid", event.target.checked)
                                }
                                className="mt-0.5 rounded border-slate-300 text-emerald-600"
                            />
                            I confirm that these are clear pictures of the front and back of my
                            government-issued ID.
                        </label>
                        {form.errors.id_is_valid && (
                            <FieldError message={form.errors.id_is_valid} />
                        )}
                    </fieldset>

                    <fieldset>
                        <legend className="text-sm font-semibold">Preferred payment method</legend>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            {(["cash", "gcash"] as const).map((method) => (
                                <label
                                    key={method}
                                    className={`rounded-xl border p-4 ${
                                        method === "gcash" && !gcashPayment.configured
                                            ? "cursor-not-allowed opacity-60"
                                            : "cursor-pointer"
                                    } ${
                                        form.data.payment_method === method
                                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50"
                                            : "border-slate-200 dark:border-slate-700"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value={method}
                                        checked={form.data.payment_method === method}
                                        disabled={method === "gcash" && !gcashPayment.configured}
                                        onChange={() => {
                                            form.setData("payment_method", method);
                                            if (method === "cash") {
                                                form.setData("payment_receipt", null);
                                            }
                                            form.clearErrors("payment_method");
                                        }}
                                        className="mr-2 accent-emerald-600"
                                    />
                                    <span className="font-semibold capitalize">{method}</span>
                                    <span className="mt-1 block pl-6 text-xs text-slate-500 dark:text-slate-400">
                                        {method === "cash"
                                            ? "Pay at the Barangay Hall."
                                            : gcashPayment.configured
                                              ? "Send the payment to the GCash number or scan the QR code below."
                                              : "GCash is temporarily unavailable until the payment details are configured."}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {form.errors.payment_method && (
                            <p className="mt-2 text-sm text-red-600">
                                {form.errors.payment_method}
                            </p>
                        )}
                    </fieldset>

                    {form.data.payment_method === "gcash" && (
                        <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20">
                            <div>
                                <h2 className="font-semibold">Send your payment via GCash</h2>
                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                    Scan the QR code or send your payment to this GCash number.
                                </p>
                                <p className="mt-2 text-lg font-bold text-emerald-800 dark:text-emerald-300">
                                    {gcashPayment.gcash_number}
                                </p>
                            </div>
                            {gcashPayment.qr_code_url && (
                                <img
                                    src={gcashPayment.qr_code_url}
                                    alt="Barangay GCash payment QR code"
                                    className="h-56 w-56 rounded-xl border border-slate-200 bg-white object-contain p-2 dark:border-slate-700"
                                />
                            )}
                            <GcashReceiptField
                                file={form.data.payment_receipt}
                                error={form.errors.payment_receipt}
                                onChange={(file) => form.setData("payment_receipt", file)}
                            />
                        </section>
                    )}

                    <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        <p>
                            Your request will be marked pending until the secretary reviews it.
                            Cash payments are recorded by the barangay staff.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={
                            form.processing ||
                            documentTypes.length === 0 ||
                            !form.data.id_is_valid ||
                            !form.data.payment_method ||
                            (form.data.payment_method === "gcash" &&
                                !form.data.payment_receipt)
                        }
                        className="w-full rounded-xl bg-emerald-600 px-8 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto sm:block sm:w-fit sm:min-w-56"
                    >
                        {form.processing ? "Submitting…" : "Submit request"}
                    </button>
                    {documentTypes.length === 0 && (
                        <p className="text-center text-sm text-amber-700">
                            No document types are currently available.
                        </p>
                    )}
                </form>
            </div>
        </>
    );
}

function RequestField({
    label,
    value,
    onChange,
    error,
    type = "text",
    required = true,
    disabled = false,
    ...inputProps
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    pattern?: string;
    max?: string;
}) {
    return (
        <label className="block text-sm font-semibold">
            {label}
            <input
                required={required}
                disabled={disabled}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                {...inputProps}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:disabled:bg-slate-800"
            />
            {error && <FieldError message={error} />}
        </label>
    );
}

function IdImageField({
    label,
    name,
    file,
    error,
    onChange,
}: {
    label: string;
    name: string;
    file: File | null;
    error?: string;
    onChange: (file: File | null) => void;
}) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div className="block text-sm font-semibold">
            <label>
                {label}
                <input
                    required
                    name={name}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                    className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:file:bg-emerald-950 dark:file:text-emerald-300"
                />
            </label>
            <span className="mt-1 block font-normal text-slate-500 dark:text-slate-400">
                JPG, PNG, or WebP image, maximum 5 MB.
                {file ? ` Selected: ${file.name}` : ""}
            </span>
            {previewUrl && file && (
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="mt-2 block text-xs font-semibold text-emerald-700 underline"
                        >
                            Preview selected ID
                        </button>
                    </DialogTrigger>
                    <DialogContent className="w-[calc(100%-2rem)] max-w-4xl">
                        <DialogHeader>
                            <DialogTitle>{label} preview</DialogTitle>
                            <DialogDescription>
                                Check that this is the correct, readable side of your ID.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex max-h-[70vh] justify-center overflow-auto rounded-md bg-slate-100 p-2 dark:bg-slate-950">
                            <img
                                src={previewUrl}
                                alt={`${label} uploaded for this request`}
                                className="h-auto max-h-[65vh] max-w-full object-contain"
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {error && <FieldError message={error} />}
        </div>
    );
}

function GcashReceiptField({
    file,
    error,
    onChange,
}: {
    file: File | null;
    error?: string;
    onChange: (file: File | null) => void;
}) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return (
        <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
                Upload GCash receipt
                <input
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:file:bg-emerald-950 dark:file:text-emerald-300"
                />
                {error && <FieldError message={error} />}
                <span className="mt-1 block font-normal text-slate-500 dark:text-slate-400">
                    Upload a JPG, PNG, or WebP image up to 5 MB. The secretary will review the
                    receipt before marking payment as paid.
                </span>
            </label>
            {file && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                        <ImagePlus className="h-4 w-4 text-emerald-600" />
                        {file.name}
                    </span>
                    {previewUrl && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="font-semibold text-emerald-700 underline"
                                >
                                    Preview selected GCash receipt
                                </button>
                            </DialogTrigger>
                            <DialogContent className="w-[calc(100%-2rem)] max-w-4xl">
                                <DialogHeader>
                                    <DialogTitle>GCash receipt preview</DialogTitle>
                                    <DialogDescription>
                                        Check that this is the correct payment receipt before
                                        submitting your request.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex max-h-[70vh] justify-center overflow-auto rounded-md bg-slate-100 p-2 dark:bg-slate-950">
                                    <img
                                        src={previewUrl}
                                        alt="Selected GCash payment receipt"
                                        className="h-auto max-h-[65vh] max-w-full object-contain"
                                    />
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            )}
        </div>
    );
}

function FieldError({ message }: { message: string }) {
    return <span className="mt-1 block text-sm font-normal text-red-600">{message}</span>;
}

function formatFee(fee: string | number): string {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(fee));
}
