import { Form, Head, Link } from '@inertiajs/react';
import {
    Building2,
    FileText,
    ShieldCheck,
} from 'lucide-react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
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
}

export default function Login({
    status,
    canResetPassword,
    canRegister = true,
}: LoginProps) {
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
                                                    <TextLink href="/forgot-password">
                                                        Forgot password?
                                                    </TextLink>
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