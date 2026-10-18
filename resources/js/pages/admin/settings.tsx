import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, QrCode, Save } from "lucide-react";
import type { FormEvent } from "react";

type GcashPayment = {
    gcash_number: string;
    qr_code_url: string | null;
    configured: boolean;
};

export default function SettingsPage({ gcashPayment }: { gcashPayment: GcashPayment }) {
    const form = useForm<{ gcash_number: string; qr_code: File | null }>({
        gcash_number: gcashPayment.gcash_number,
        qr_code: null,
    });

    const saveSettings = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch("/admin/settings/gcash-payment", {
            forceFormData: true,
            onSuccess: () => form.setData("qr_code", null),
        });
    };

    return (
        <>
            <Head title="System Settings" />
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
                <div className="mx-auto w-full max-w-4xl">
                    <Link
                        href="/admin/dashboard"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <header className="mb-6">
                        <h1 className="text-2xl font-bold md:text-3xl">System Settings</h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Configure the GCash payment destination shown to residents.
                        </p>
                    </header>

                    <form
                        onSubmit={saveSettings}
                        className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                    >
                        <div className="flex items-start gap-3">
                            <QrCode className="mt-1 h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <h2 className="font-bold">GCash payment details</h2>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Residents will see these details when they select GCash.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="gcash_number"
                                className="mb-2 block text-sm font-medium"
                            >
                                GCash number
                            </label>
                            <input
                                id="gcash_number"
                                type="tel"
                                required
                                value={form.data.gcash_number}
                                onChange={(event) =>
                                    form.setData("gcash_number", event.target.value)
                                }
                                placeholder="09XXXXXXXXX"
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                            />
                            {form.errors.gcash_number && (
                                <p className="mt-1 text-sm text-red-600">
                                    {form.errors.gcash_number}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="gcash_qr_code"
                                className="mb-2 block text-sm font-medium"
                            >
                                GCash QR code
                            </label>
                            <input
                                id="gcash_qr_code"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                required={!gcashPayment.qr_code_url}
                                onChange={(event) =>
                                    form.setData("qr_code", event.target.files?.[0] ?? null)
                                }
                                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-semibold file:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:file:bg-emerald-950 dark:file:text-emerald-300"
                            />
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Upload a JPG, PNG, or WebP image up to 5 MB.
                            </p>
                            {form.errors.qr_code && (
                                <p className="mt-1 text-sm text-red-600">{form.errors.qr_code}</p>
                            )}
                        </div>

                        {gcashPayment.qr_code_url && (
                            <div>
                                <p className="mb-2 text-sm font-medium">Current QR code</p>
                                <img
                                    src={gcashPayment.qr_code_url}
                                    alt="Current GCash payment QR code"
                                    className="h-56 w-56 rounded-xl border border-slate-200 bg-white object-contain p-2 dark:border-slate-700"
                                />
                            </div>
                        )}

                        <div
                            role="status"
                            className={`rounded-xl p-3 text-sm font-medium ${
                                gcashPayment.configured
                                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                                    : "bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                            }`}
                        >
                            {gcashPayment.configured
                                ? "GCash is available to residents."
                                : "GCash is unavailable until you save a number and QR code."}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {form.processing ? "Saving…" : "Save GCash details"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
