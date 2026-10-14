import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/routes';
import { email } from '@/routes/password';
export default function ForgotPassword({ status }: { status?: string }) {
    return (
        <>
            <Head title="Forgot password" />

            <div className="min-h-screen bg-[#edf4f1] text-slate-900">
                <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col">
                    <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
                        <div className="w-full max-w-3xl">
                            {status && (
                                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700 shadow-sm">
                                    {status}
                                </div>
                            )}

                            <Form
                                {...email.form()}
                                className="w-full"
                            >
                                {({ processing, errors }) => (
                                    <div className="space-y-5">
                                        <div className="grid gap-3">
                                            <Label htmlFor="email" className="text-base font-medium text-slate-700">
                                                Email address
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                autoComplete="off"
                                                autoFocus
                                                placeholder="email@example.com"
                                                className="h-14 rounded-xl border border-emerald-200 bg-white/80 px-4 text-base text-slate-900 shadow-[inset_0_1px_2px_rgba(15,23,42,0.04)] transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100/80"
                                            />
                                            <InputError message={errors.email} className="text-sm" />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="h-14 w-full rounded-xl bg-[#0f9a67] text-base font-semibold text-white shadow-[0_14px_30px_-18px_rgba(15,118,80,0.9)] transition hover:bg-[#0d8c5d] focus-visible:ring-emerald-200 disabled:opacity-80"
                                            disabled={processing}
                                            data-test="email-password-reset-link-button"
                                        >
                                            {processing ? (
                                                <>
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    Sending...
                                                </>
                                            ) : (
                                                'Email password reset link'
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </Form>

                            <div className="mt-8 text-center text-sm text-slate-600">
                                <span>Or, return to </span>
                                <TextLink href={login()} className="font-medium text-slate-700">
                                    log in
                                </TextLink>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
}

ForgotPassword.layout = {
    title: 'Forgot password',
    description: 'Enter your email to receive a password reset link',
};
