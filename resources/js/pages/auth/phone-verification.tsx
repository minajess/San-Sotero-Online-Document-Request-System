import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, MessageSquareText, ShieldCheck } from "lucide-react";
import type { FormEvent } from "react";

type Props = {
    maskedPhone: string;
    needsPhone: boolean;
    codeTtlMinutes: number;
    maxAttempts: number;
    status?: string;
};

export default function PhoneVerification({
    maskedPhone,
    needsPhone,
    codeTtlMinutes,
    maxAttempts,
    status,
}: Props) {
    const verifyForm = useForm({ code: "" });
    const sendForm = useForm({ contact_number: "" });

    const verify = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        verifyForm.post("/phone/verify");
    };

    const sendCode = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        sendForm.post("/phone/verify/send");
    };

    return (
        <>
            <Head title="Verify your phone" />
            <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
                <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
                    <Link
                        href="/login"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to login
                    </Link>

                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="h-7 w-7" />
                    </div>

                    <h1 className="text-2xl font-black">Verify your phone</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                        {needsPhone
                            ? "Add a Philippine mobile number. We will text you a one-time verification code."
                            : `Enter the six-digit code sent to ${maskedPhone}.`}
                    </p>

                    {status && (
                        <p
                            role="status"
                            className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
                        >
                            {status}
                        </p>
                    )}

                    {needsPhone ? (
                        <form onSubmit={sendCode} className="mt-6 space-y-4">
                            <label className="block text-sm font-semibold">
                                Philippine mobile number
                                <input
                                    required
                                    type="tel"
                                    inputMode="tel"
                                    autoComplete="tel"
                                    pattern="(?:09\d{9}|\+639\d{9}|639\d{9})"
                                    placeholder="09XXXXXXXXX"
                                    value={sendForm.data.contact_number}
                                    onChange={(event) =>
                                        sendForm.setData("contact_number", event.target.value)
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
                                />
                                {sendForm.errors.contact_number && (
                                    <span className="mt-1 block text-sm font-normal text-red-600">
                                        {sendForm.errors.contact_number}
                                    </span>
                                )}
                            </label>
                            <button
                                type="submit"
                                disabled={sendForm.processing}
                                className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {sendForm.processing ? "Sending code…" : "Send verification code"}
                            </button>
                        </form>
                    ) : (
                        <>
                            <form onSubmit={verify} className="mt-6 space-y-4">
                                <label className="block text-sm font-semibold">
                                    Six-digit verification code
                                    <input
                                        required
                                        type="text"
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        pattern="\d{6}"
                                        maxLength={6}
                                        value={verifyForm.data.code}
                                        onChange={(event) =>
                                            verifyForm.setData(
                                                "code",
                                                event.target.value.replace(/\D/g, ""),
                                            )
                                        }
                                        className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-[0.4em]"
                                    />
                                    {verifyForm.errors.code && (
                                        <span className="mt-1 block text-sm font-normal text-red-600">
                                            {verifyForm.errors.code}
                                        </span>
                                    )}
                                </label>
                                <button
                                    type="submit"
                                    disabled={
                                        verifyForm.processing || verifyForm.data.code.length !== 6
                                    }
                                    className="w-full rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {verifyForm.processing ? "Verifying…" : "Verify account"}
                                </button>
                            </form>

                            <form
                                onSubmit={sendCode}
                                className="mt-4 border-t border-slate-100 pt-4"
                            >
                                <button
                                    type="submit"
                                    disabled={sendForm.processing}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    <MessageSquareText className="h-4 w-4" />
                                    {sendForm.processing ? "Sending…" : "Resend verification code"}
                                </button>
                                {sendForm.errors.contact_number && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {sendForm.errors.contact_number}
                                    </p>
                                )}
                            </form>
                        </>
                    )}

                    <p className="mt-6 text-xs leading-5 text-slate-500">
                        Codes expire after {codeTtlMinutes} minutes and are limited to {maxAttempts}{" "}
                        attempts. Standard SMS charges may apply.
                    </p>
                </section>
            </main>
        </>
    );
}
