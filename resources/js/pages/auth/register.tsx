import { Form, Head, Link } from "@inertiajs/react";
import { ArrowRight, FileText, ShieldCheck, UserPlus, Users } from "lucide-react";
import { useState } from "react";

import InputError from "@/components/input-error";
import PasswordInput from "@/components/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { store } from "@/routes/register";

interface RegisterProps {
    passwordRules?: string;
}

export default function Register({ passwordRules }: RegisterProps) {
    const [middleNameNotApplicable, setMiddleNameNotApplicable] = useState(false);

    return (
        <>
            <Head title="Create Account" />

            <div className="min-h-screen bg-slate-50 text-slate-900">
                {/* HEADER */}
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                        {/* LOGO */}
                        <Link href="/" className="flex items-center gap-3">
                            <img
                                src="/brgyLogo.png"
                                alt="Barangay San Sotero"
                                className="h-12 w-12 rounded-full border-2 border-emerald-100 object-cover"
                            />

                            <div>
                                <p className="text-sm font-bold tracking-wide text-emerald-600">
                                    BARANGAY
                                </p>

                                <p className="font-bold leading-none text-slate-900">SAN SOTERO</p>
                            </div>
                        </Link>

                        {/* LOGIN */}
                        <div className="flex items-center gap-3">
                            <span className="hidden text-sm text-slate-500 sm:block">
                                Already have an account?
                            </span>

                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50"
                            >
                                Log in
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </header>

                {/* MAIN */}
                <main className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl lg:grid-cols-2">
                    {/* LEFT BRANDING */}
                    <section className="relative hidden overflow-hidden bg-emerald-700 lg:flex">
                        {/* Background decoration */}
                        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/30" />

                        <div className="absolute -bottom-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-emerald-800/40" />

                        <div className="relative z-10 flex w-full flex-col justify-center px-10 py-16 xl:px-16">
                            {/* Logo */}
                            <div className="mb-10">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-lg">
                                    <img
                                        src="/brgyLogo.png"
                                        alt="Barangay San Sotero"
                                        className="h-14 w-14 rounded-full object-cover"
                                    />
                                </div>
                            </div>

                            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-emerald-100">
                                Barangay San Sotero
                            </p>

                            <h1 className="max-w-lg text-4xl font-black leading-tight text-white xl:text-5xl">
                                Join our
                                <span className="block text-emerald-200">community.</span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base leading-7 text-emerald-50 xl:text-lg">
                                Create your account and access convenient barangay services online.
                                Request documents, monitor your requests, and receive updates
                                without unnecessary waiting.
                            </p>

                            {/* FEATURES */}
                            <div className="mt-10 space-y-6">
                                <Feature
                                    icon={FileText}
                                    title="Easy Document Requests"
                                    description="Submit your barangay document requests online."
                                />

                                <Feature
                                    icon={ShieldCheck}
                                    title="Secure & Safe"
                                    description="Your account and information are protected."
                                />

                                <Feature
                                    icon={Users}
                                    title="Better Public Service"
                                    description="Enjoy a faster and more convenient barangay experience."
                                />
                            </div>
                        </div>
                    </section>

                    {/* RIGHT REGISTER */}
                    <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10 xl:px-16">
                        <div className="w-full max-w-xl">
                            {/* MOBILE BRANDING */}
                            <div className="mb-8 text-center lg:hidden">
                                <img
                                    src="/brgyLogo.png"
                                    alt="Barangay San Sotero"
                                    className="mx-auto h-20 w-20 rounded-full border-4 border-white object-cover shadow-md"
                                />

                                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-emerald-600">
                                    Barangay San Sotero
                                </p>

                                <h1 className="mt-1 text-xl font-black text-slate-900">
                                    Online Document Request System
                                </h1>
                            </div>

                            {/* REGISTER CARD */}
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 xl:p-10">
                                {/* TITLE */}
                                <div className="mb-8">
                                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                                        <UserPlus className="h-7 w-7 text-emerald-600" />
                                    </div>

                                    <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                                        Create Account
                                    </h2>

                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Fill in the details below to create your resident account.
                                    </p>
                                </div>

                                {/* FORM */}
                                <Form
                                    {...store.form()}
                                    resetOnSuccess={["password", "password_confirmation"]}
                                    className="space-y-5"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            {/* PERSONAL INFORMATION */}
                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="first_name"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        First Name
                                                    </Label>
                                                    <Input
                                                        id="first_name"
                                                        name="first_name"
                                                        required
                                                        autoFocus
                                                        autoComplete="given-name"
                                                        placeholder="First name"
                                                        className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                    />
                                                    <InputError message={errors.first_name} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="surname"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Surname
                                                    </Label>
                                                    <Input
                                                        id="surname"
                                                        name="surname"
                                                        required
                                                        autoComplete="family-name"
                                                        placeholder="Surname"
                                                        className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                    />
                                                    <InputError message={errors.surname} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="middle_name"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Middle Name
                                                    </Label>
                                                    <input
                                                        type="hidden"
                                                        name="middle_name_na"
                                                        value={middleNameNotApplicable ? "1" : "0"}
                                                    />
                                                    <Input
                                                        id="middle_name"
                                                        name="middle_name"
                                                        required={!middleNameNotApplicable}
                                                        disabled={middleNameNotApplicable}
                                                        autoComplete="additional-name"
                                                        placeholder={
                                                            middleNameNotApplicable
                                                                ? "Not applicable"
                                                                : "Middle name"
                                                        }
                                                        className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                    />
                                                    <label className="flex items-center gap-2 text-sm font-normal text-slate-600">
                                                        <input
                                                            type="checkbox"
                                                            checked={middleNameNotApplicable}
                                                            onChange={(event) =>
                                                                setMiddleNameNotApplicable(
                                                                    event.target.checked,
                                                                )
                                                            }
                                                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                        />
                                                        N/A — I do not have a middle name
                                                    </label>
                                                    <InputError message={errors.middle_name} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="birthdate"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Birthdate
                                                    </Label>
                                                    <Input
                                                        id="birthdate"
                                                        name="birthdate"
                                                        type="date"
                                                        required
                                                        max={new Date().toISOString().slice(0, 10)}
                                                        autoComplete="bday"
                                                        className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                    />
                                                    <InputError message={errors.birthdate} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="sex"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Sex
                                                    </Label>
                                                    <select
                                                        id="sex"
                                                        name="sex"
                                                        required
                                                        defaultValue=""
                                                        className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                                    >
                                                        <option value="" disabled>
                                                            Select sex
                                                        </option>
                                                        <option value="Female">Female</option>
                                                        <option value="Male">Male</option>
                                                    </select>
                                                    <InputError message={errors.sex} />
                                                </div>
                                            </div>

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="address"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Address
                                                    </Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        required
                                                        autoComplete="street-address"
                                                        placeholder="House number, street, or landmark"
                                                        className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                    />
                                                    <InputError message={errors.address} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="zone"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Zone
                                                    </Label>
                                                    <Input
                                                        id="zone"
                                                        name="zone"
                                                        required
                                                        placeholder="Enter your zone or purok"
                                                        className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                    />
                                                    <InputError message={errors.zone} />
                                                </div>
                                            </div>

                                            {/* EMAIL */}
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="email"
                                                    className="font-semibold text-slate-700"
                                                >
                                                    Email Address
                                                </Label>

                                                <Input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    autoComplete="email"
                                                    placeholder="you@example.com"
                                                    className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                />

                                                <InputError message={errors.email} />
                                            </div>

                                            {/* CONTACT NUMBER */}
                                            <div className="grid gap-2">
                                                <Label
                                                    htmlFor="contact_number"
                                                    className="font-semibold text-slate-700"
                                                >
                                                    Contact Number
                                                </Label>
                                                <Input
                                                    id="contact_number"
                                                    name="contact_number"
                                                    type="tel"
                                                    required
                                                    autoComplete="tel"
                                                    inputMode="tel"
                                                    placeholder="09XXXXXXXXX"
                                                    pattern="(?:09\d{9}|\+639\d{9}|639\d{9})"
                                                    className="h-12 rounded-xl border-slate-300 px-4 focus:border-emerald-500 focus:ring-emerald-500"
                                                />
                                                <InputError message={errors.contact_number} />
                                            </div>

                                            {/* PASSWORD GRID */}
                                            <div className="grid gap-5 sm:grid-cols-2">
                                                {/* PASSWORD */}
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="password"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Password
                                                    </Label>

                                                    <PasswordInput
                                                        id="password"
                                                        name="password"
                                                        required
                                                        autoComplete="new-password"
                                                        placeholder="Enter password"
                                                        className="h-12 rounded-xl border-slate-300"
                                                    />

                                                    <InputError message={errors.password} />
                                                </div>

                                                {/* CONFIRM PASSWORD */}
                                                <div className="grid gap-2">
                                                    <Label
                                                        htmlFor="password_confirmation"
                                                        className="font-semibold text-slate-700"
                                                    >
                                                        Confirm Password
                                                    </Label>

                                                    <PasswordInput
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        required
                                                        autoComplete="new-password"
                                                        placeholder="Confirm password"
                                                        className="h-12 rounded-xl border-slate-300"
                                                    />

                                                    <InputError
                                                        message={errors.password_confirmation}
                                                    />
                                                </div>
                                            </div>

                                            {/* PASSWORD RULES */}
                                            {passwordRules && (
                                                <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                                                    <span className="font-semibold text-slate-700">
                                                        Password requirements:
                                                    </span>{" "}
                                                    {passwordRules}
                                                </div>
                                            )}

                                            {/* REGISTER BUTTON */}
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="h-12 w-full rounded-xl bg-emerald-600 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {processing && <Spinner className="mr-2" />}

                                                {processing
                                                    ? "Creating account..."
                                                    : "Create Account"}

                                                {!processing && (
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                )}
                                            </Button>

                                            {/* LOGIN LINK */}
                                            <div className="border-t border-slate-100 pt-5 text-center">
                                                <p className="text-sm text-slate-500">
                                                    Already have an account?{" "}
                                                    <Link
                                                        href="/login"
                                                        className="font-semibold text-emerald-600 transition hover:text-emerald-700"
                                                    >
                                                        Log in
                                                    </Link>
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            </div>

                            {/* SECURITY FOOTER */}
                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                                <ShieldCheck className="h-4 w-4" />
                                Secure Barangay Online Services
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}

/* FEATURE COMPONENT */

function Feature({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof FileText;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-5 w-5 text-white" />
            </div>

            <div>
                <h3 className="font-bold text-white">{title}</h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-emerald-100">{description}</p>
            </div>
        </div>
    );
}
