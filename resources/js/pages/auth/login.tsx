import { Form, Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    FileText,
    KeyRound,
    LoaderCircle,
    MailCheck,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister?: boolean;
    csrfToken: string;
    passwordRules: string;
}

type RecoveryField = 'email' | 'code' | 'password' | 'password_confirmation';
type RecoveryErrors = Partial<Record<RecoveryField, string>>;

interface RecoveryResponse {
    message?: string;
    retry_after?: number;
    reset_token?: string;
    errors?: Partial<Record<RecoveryField, string[]>>;
}

class RecoveryRequestError extends Error {
    constructor(
        message: string,
        readonly errors?: RecoveryResponse['errors'],
        readonly retryAfter?: number,
    ) {
        super(message);
    }
}

async function postRecovery(
    endpoint: string,
    data: Record<string, string>,
    csrfToken: string,
): Promise<RecoveryResponse> {
    const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(data),
    });

    const payload = (await response.json()) as RecoveryResponse;

    if (!response.ok) {
        throw new RecoveryRequestError(
            payload.message ?? 'Unable to process your request. Please try again.',
            payload.errors,
            payload.retry_after,
        );
    }

    return payload;
}

export default function Login({
    status,
    canResetPassword,
    canRegister = true,
    csrfToken,
    passwordRules,
}: LoginProps) {
    const [recoveryStep, setRecoveryStep] = useState<
        'login' | 'email' | 'verify' | 'reset' | 'success'
    >('login');
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [resetToken, setResetToken] = useState('');
    const [recoveryError, setRecoveryError] = useState('');
    const [recoveryErrors, setRecoveryErrors] = useState<RecoveryErrors>({});
    const [isRecovering, setIsRecovering] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    useEffect(() => {
        if (resendCountdown === 0) {
            return;
        }

        const timer = window.setTimeout(
            () => setResendCountdown((seconds) => Math.max(seconds - 1, 0)),
            1000,
        );

        return () => window.clearTimeout(timer);
    }, [resendCountdown]);

    const handleRecoveryError = (error: unknown) => {
        if (error instanceof RecoveryRequestError) {
            setRecoveryError(error.message);
            if (error.retryAfter) {
                setResendCountdown(error.retryAfter);
            }
            setRecoveryErrors({
                email: error.errors?.email?.[0],
                code: error.errors?.code?.[0],
                password: error.errors?.password?.[0],
                password_confirmation: error.errors?.password_confirmation?.[0],
            });
            return;
        }

        setRecoveryError('Unable to process your request right now. Please try again.');
    };

    const requestCode = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await requestCodeFromButton();
    };

    const requestCodeFromButton = async () => {
        setIsRecovering(true);
        setRecoveryError('');
        setRecoveryErrors({});

        try {
            const result = await postRecovery(
                '/password-recovery/code',
                { email: recoveryEmail },
                csrfToken,
            );
            setVerificationCode('');
            setResendCountdown(result.retry_after ?? 60);
            setRecoveryStep('verify');
        } catch (error) {
            handleRecoveryError(error);
        } finally {
            setIsRecovering(false);
        }
    };

    const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsRecovering(true);
        setRecoveryError('');
        setRecoveryErrors({});

        try {
            const result = await postRecovery(
                '/password-recovery/verify',
                { email: recoveryEmail, code: verificationCode },
                csrfToken,
            );
            if (!result.reset_token) {
                throw new Error('Verification could not be completed. Request a new code.');
            }

            setResetToken(result.reset_token);
            setRecoveryStep('reset');
        } catch (error) {
            handleRecoveryError(error);
        } finally {
            setIsRecovering(false);
        }
    };

    const resetPassword = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsRecovering(true);
        setRecoveryError('');
        setRecoveryErrors({});

        try {
            await postRecovery(
                '/password-recovery/reset',
                {
                    email: recoveryEmail,
                    reset_token: resetToken,
                    password: newPassword,
                    password_confirmation: passwordConfirmation,
                },
                csrfToken,
            );
            setNewPassword('');
            setPasswordConfirmation('');
            setResetToken('');
            setRecoveryStep('success');
        } catch (error) {
            handleRecoveryError(error);
        } finally {
            setIsRecovering(false);
        }
    };

    const backToLogin = () => {
        setRecoveryStep('login');
        setRecoveryEmail('');
        setVerificationCode('');
        setNewPassword('');
        setPasswordConfirmation('');
        setResetToken('');
        setRecoveryError('');
        setRecoveryErrors({});
        setResendCountdown(0);
    };

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">

                {/* LEFT SIDE - BRANDING */}
                <div className="relative hidden min-h-screen overflow-hidden bg-emerald-700 lg:flex">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-500" />

                    <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5" />
                    <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/5" />

                    <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

                        {/* LOGO */}
                        <div className="flex items-center gap-4">
                            <img
                                src="/brgyLogo.png"
                                alt="Barangay San Sotero Logo"
                                className="h-16 w-16 rounded-full border-4 border-white/20 bg-white object-cover shadow-lg"
                            />

                            <div className="text-white">
                                <p className="text-sm font-medium uppercase tracking-widest text-emerald-100">
                                    Barangay
                                </p>

                                <h1 className="text-2xl font-black tracking-tight">
                                    San Sotero
                                </h1>
                            </div>
                        </div>

                        {/* HERO CONTENT */}
                        <div className="max-w-xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                                <ShieldCheck className="h-4 w-4" />
                                Official Online Service
                            </div>

                            <h2 className="text-4xl font-black leading-tight tracking-tight text-white xl:text-5xl">
                                Online Barangay
                                <br />
                                Document Services
                            </h2>

                            <p className="mt-6 max-w-lg text-base leading-7 text-emerald-50 xl:text-lg">
                                Request your barangay documents online
                                without the long lines. Submit your request,
                                track its status, and claim your document at
                                the barangay hall when it is ready.
                            </p>

                            {/* FEATURES */}
                            <div className="mt-8 grid gap-4 sm:grid-cols-2">

                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>

                                    <div>
                                        <p className="font-semibold text-white">
                                            Easy Requests
                                        </p>
                                        <p className="text-xs text-emerald-100">
                                            Apply online anytime
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                        <Building2 className="h-5 w-5 text-white" />
                                    </div>

                                    <div>
                                        <p className="font-semibold text-white">
                                            Secure Service
                                        </p>
                                        <p className="text-xs text-emerald-100">
                                            Official barangay system
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="text-sm text-emerald-100">
                            © {new Date().getFullYear()} Barangay San Sotero
                            <span className="mx-2">•</span>
                            Online Document Request System
                        </div>

                    </div>
                </div>

                {/* RIGHT SIDE - LOGIN */}
                <div className="flex min-h-screen w-full items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

                    <div className="w-full max-w-md">

                        {/* MOBILE LOGO */}
                        <div className="mb-8 flex flex-col items-center text-center lg:hidden">

                            <img
                                src="/brgyLogo.png"
                                alt="Barangay San Sotero Logo"
                                className="h-20 w-20 rounded-full border-4 border-white bg-white object-cover shadow-md"
                            />

                            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600">
                                Barangay San Sotero
                            </p>

                            <h1 className="mt-1 text-xl font-black text-slate-900">
                                Online Document Request System
                            </h1>

                        </div>

                        {/* LOGIN CARD */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

                            {recoveryStep === 'login' ? (
                                <>
                            <div className="mb-8">
                                <p className="text-sm font-semibold text-emerald-600">
                                    Welcome back
                                </p>

                                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                    Sign in to your account
                                </h2>

                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    Enter your account details to access the
                                    barangay document request system.
                                </p>
                            </div>

                            <Form
                                {...store.form()}
                                resetOnSuccess={['password']}
                                className="space-y-5"
                            >
                                {({
                                    errors,
                                    processing,
                                    recentlySuccessful,
                                }) => (
                                    <>
                                        {/* EMAIL */}
                                        <div className="grid gap-2">
                                            <Label
                                                htmlFor="email"
                                                className="text-sm font-semibold text-slate-700"
                                            >
                                                Email Address
                                            </Label>

                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                className="h-12 w-full rounded-xl border-slate-300 bg-white px-4 transition focus:border-emerald-500 focus:ring-emerald-500"
                                            />

                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>

                                        {/* PASSWORD */}
                                        <div className="grid gap-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <Label
                                                    htmlFor="password"
                                                    className="text-sm font-semibold text-slate-700"
                                                >
                                                    Password
                                                </Label>

                                                {canResetPassword && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setRecoveryStep('email');
                                                            setRecoveryError('');
                                                        }}
                                                        className="text-sm font-medium text-emerald-700 underline decoration-emerald-300 underline-offset-4 transition hover:text-emerald-800"
                                                    >
                                                        Forgot password?
                                                    </button>
                                                )}
                                            </div>

                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                className="h-12 w-full rounded-xl border-slate-300"
                                            />

                                            <InputError
                                                message={errors.password}
                                            />
                                        </div>

                                        {/* REMEMBER ME */}
                                        <div className="flex items-center">
                                            <label
                                                htmlFor="remember"
                                                className="flex cursor-pointer items-center gap-3"
                                            >
                                                <Checkbox
                                                    id="remember"
                                                    name="remember"
                                                />

                                                <span className="text-sm text-slate-600">
                                                    Remember me
                                                </span>
                                            </label>
                                        </div>

                                        {/* LOGIN BUTTON */}
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="h-12 w-full rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
                                        >
                                            {processing && (
                                                <Spinner className="mr-2" />
                                            )}

                                            {processing
                                                ? 'Signing in...'
                                                : 'Sign In'}
                                        </Button>

                                        {/* SUCCESS */}
                                        {recentlySuccessful && (
                                            <p className="text-center text-sm font-medium text-emerald-600">
                                                Successfully signed in.
                                            </p>
                                        )}

                                        {/* STATUS */}
                                        {status && (
                                            <p className="text-center text-sm font-medium text-emerald-600">
                                                {status}
                                            </p>
                                        )}

                                        {/* REGISTER */}
                                        {canRegister && (
                                            <div className="border-t border-slate-100 pt-5 text-center">
                                                <p className="text-sm text-slate-500">
                                                    Don't have an account?{' '}
                                                    <Link
                                                        href="/register"
                                                        className="font-semibold text-emerald-600 transition hover:text-emerald-700"
                                                    >
                                                        Create an account
                                                    </Link>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Form>

                                </>
                            ) : (
                                <div>
                                    <button
                                        type="button"
                                        onClick={backToLogin}
                                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-emerald-700"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Login
                                    </button>

                                    <div className="mb-7">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                            {recoveryStep === 'success' ? (
                                                <MailCheck className="h-6 w-6" />
                                            ) : (
                                                <KeyRound className="h-6 w-6" />
                                            )}
                                        </div>
                                        <p className="text-sm font-semibold text-emerald-600">
                                            Account recovery
                                        </p>
                                        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                            {recoveryStep === 'email' && 'Reset your password'}
                                            {recoveryStep === 'verify' && 'Check your email'}
                                            {recoveryStep === 'reset' && 'Choose a new password'}
                                            {recoveryStep === 'success' && 'Password reset complete'}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {recoveryStep === 'email' &&
                                                'Enter your email address to continue.'}
                                            {recoveryStep === 'verify' &&
                                                'Enter the 6-digit verification code if you received one.'}
                                            {recoveryStep === 'reset' &&
                                                'Create a new password for your account.'}
                                            {recoveryStep === 'success' &&
                                                'Your password has been reset successfully. You can now sign in with your new password.'}
                                        </p>
                                    </div>

                                    {recoveryError && (
                                        <div
                                            role="alert"
                                            className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                                        >
                                            {recoveryError}
                                        </div>
                                    )}

                                    {recoveryStep === 'email' && (
                                        <form onSubmit={requestCode} className="space-y-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="recovery-email" className="text-sm font-semibold text-slate-700">
                                                    Email Address
                                                </Label>
                                                <Input
                                                    id="recovery-email"
                                                    type="email"
                                                    autoComplete="email"
                                                    autoFocus
                                                    required
                                                    value={recoveryEmail}
                                                    onChange={(event) => setRecoveryEmail(event.target.value)}
                                                    placeholder="you@example.com"
                                                    aria-invalid={Boolean(recoveryErrors.email)}
                                                    className="h-12 w-full rounded-xl border-slate-300 bg-white px-4 transition focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                                <InputError message={recoveryErrors.email} />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isRecovering}
                                                className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:text-base"
                                            >
                                                {isRecovering && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                {isRecovering ? 'Sending code...' : 'Send Verification Code'}
                                            </Button>
                                        </form>
                                    )}

                                    {recoveryStep === 'verify' && (
                                        <form onSubmit={verifyCode} className="space-y-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="verification-code" className="text-sm font-semibold text-slate-700">
                                                    Verification Code
                                                </Label>
                                                <Input
                                                    id="verification-code"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    autoFocus
                                                    required
                                                    maxLength={6}
                                                    value={verificationCode}
                                                    onChange={(event) =>
                                                        setVerificationCode(
                                                            event.target.value.replace(/\D/g, '').slice(0, 6),
                                                        )
                                                    }
                                                    placeholder="Enter 6-digit code"
                                                    aria-invalid={Boolean(recoveryErrors.code)}
                                                    className="h-12 w-full rounded-xl border-slate-300 bg-white px-4 text-center text-lg tracking-[0.35em] focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                                <InputError message={recoveryErrors.code} />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={isRecovering || verificationCode.length !== 6}
                                                className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:text-base"
                                            >
                                                {isRecovering && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                {isRecovering ? 'Verifying...' : 'Verify Code'}
                                            </Button>
                                            <div className="text-center text-sm text-slate-500">
                                                {resendCountdown > 0 ? (
                                                    <span>Resend available in {resendCountdown}s</span>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={isRecovering}
                                                        onClick={requestCodeFromButton}
                                                        className="font-semibold text-emerald-700 underline underline-offset-4 hover:text-emerald-800 disabled:opacity-60"
                                                    >
                                                        Resend Code
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    )}

                                    {recoveryStep === 'reset' && (
                                        <form onSubmit={resetPassword} className="space-y-5">
                                            <div className="grid gap-2">
                                                <Label htmlFor="new-password" className="text-sm font-semibold text-slate-700">
                                                    New Password
                                                </Label>
                                                <PasswordInput
                                                    id="new-password"
                                                    autoComplete="new-password"
                                                    autoFocus
                                                    required
                                                    passwordrules={passwordRules}
                                                    value={newPassword}
                                                    onChange={(event) => setNewPassword(event.target.value)}
                                                    placeholder="Enter a new password"
                                                    className="h-12 w-full rounded-xl border-slate-300 bg-white"
                                                />
                                                <InputError message={recoveryErrors.password} />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="confirm-new-password" className="text-sm font-semibold text-slate-700">
                                                    Confirm New Password
                                                </Label>
                                                <PasswordInput
                                                    id="confirm-new-password"
                                                    autoComplete="new-password"
                                                    required
                                                    value={passwordConfirmation}
                                                    onChange={(event) => setPasswordConfirmation(event.target.value)}
                                                    placeholder="Re-enter your new password"
                                                    className="h-12 w-full rounded-xl border-slate-300 bg-white"
                                                />
                                                <InputError message={recoveryErrors.password_confirmation} />
                                            </div>
                                            <p className="text-xs leading-5 text-slate-500">
                                                Password must meet the account security requirements.
                                            </p>
                                            <Button
                                                type="submit"
                                                disabled={isRecovering}
                                                className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60 sm:text-base"
                                            >
                                                {isRecovering && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                                {isRecovering ? 'Resetting password...' : 'Reset Password'}
                                            </Button>
                                        </form>
                                    )}

                                    {recoveryStep === 'success' && (
                                        <Button
                                            type="button"
                                            onClick={backToLogin}
                                            className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:text-base"
                                        >
                                            Back to Login
                                        </Button>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* MOBILE FOOTER */}
                        <p className="mt-6 text-center text-xs text-slate-400">
                            © {new Date().getFullYear()} Barangay San Sotero
                        </p>

                    </div>
                </div>
            </div>
        </>
    );
}