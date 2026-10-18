import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Mail, Plus, UserCog, X } from "lucide-react";
import { useState, type FormEvent } from "react";

type StaffMember = {
    id: number;
    name: string;
    email: string;
    contact_number: string | null;
    phone_verified_at: string | null;
    created_at: string;
};

export default function StaffPage({ staff }: { staff: StaffMember[] }) {
    const [adding, setAdding] = useState(false);
    const form = useForm({
        first_name: "",
        middle_name: "",
        middle_name_na: "0",
        surname: "",
        birthdate: "",
        address: "",
        zone: "",
        sex: "",
        email: "",
        contact_number: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post("/admin/staff", {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setAdding(false);
            },
        });
    };

    return (
        <>
            <Head title="Barangay Staff" />
            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
                <div className="mx-auto w-full max-w-none">
                    <Link
                        href="/admin/dashboard"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h1 className="text-2xl font-bold md:text-3xl">Barangay Staff</h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Create secretary accounts for staff who process resident requests.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAdding((value) => !value)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            {adding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            {adding ? "Cancel" : "Add Staff"}
                        </button>
                    </div>

                    {adding && (
                        <form
                            onSubmit={submit}
                            className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <Field
                                label="First name"
                                value={form.data.first_name}
                                onChange={(value) => form.setData("first_name", value)}
                                error={form.errors.first_name}
                            />
                            <Field
                                label="Surname"
                                value={form.data.surname}
                                onChange={(value) => form.setData("surname", value)}
                                error={form.errors.surname}
                            />
                            <div>
                                <Field
                                    label="Middle name"
                                    value={form.data.middle_name}
                                    onChange={(value) => form.setData("middle_name", value)}
                                    error={form.errors.middle_name}
                                    required={form.data.middle_name_na !== "1"}
                                    disabled={form.data.middle_name_na === "1"}
                                />
                                <label className="mt-2 flex items-center gap-2 text-sm font-normal">
                                    <input
                                        type="checkbox"
                                        checked={form.data.middle_name_na === "1"}
                                        onChange={(event) => {
                                            form.setData(
                                                "middle_name_na",
                                                event.target.checked ? "1" : "0",
                                            );
                                            if (event.target.checked) {
                                                form.setData("middle_name", "");
                                            }
                                        }}
                                        className="rounded border-slate-300 text-emerald-600"
                                    />
                                    N/A — no middle name
                                </label>
                            </div>
                            <Field
                                label="Birthdate"
                                type="date"
                                value={form.data.birthdate}
                                onChange={(value) => form.setData("birthdate", value)}
                                error={form.errors.birthdate}
                            />
                            <Field
                                label="Address"
                                value={form.data.address}
                                onChange={(value) => form.setData("address", value)}
                                error={form.errors.address}
                            />
                            <Field
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
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"
                                >
                                    <option value="" disabled>
                                        Select sex
                                    </option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                                {form.errors.sex && (
                                    <span className="mt-1 block text-sm font-normal text-red-600">
                                        {form.errors.sex}
                                    </span>
                                )}
                            </label>
                            <Field
                                label="Email address"
                                type="email"
                                value={form.data.email}
                                onChange={(value) => form.setData("email", value)}
                                error={form.errors.email}
                            />
                            <Field
                                label="Philippine mobile number (optional)"
                                type="tel"
                                value={form.data.contact_number}
                                onChange={(value) => form.setData("contact_number", value)}
                                error={form.errors.contact_number}
                                required={false}
                            />
                            <Field
                                label="Initial password (at least 8 characters)"
                                type="password"
                                value={form.data.password}
                                onChange={(value) => form.setData("password", value)}
                                error={form.errors.password}
                            />
                            <Field
                                label="Confirm password"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(value) => form.setData("password_confirmation", value)}
                            />
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {form.processing
                                        ? "Creating account…"
                                        : "Create account"}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {staff.map((member) => (
                            <StaffCard key={member.id} member={member} />
                        ))}
                        {staff.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                                No secretary accounts yet. Add staff to allow request processing.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function Field({
    label,
    value,
    onChange,
    error,
    type = "text",
    required = true,
    disabled = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    required?: boolean;
    disabled?: boolean;
}) {
    return (
        <label className="block text-sm font-semibold">
            {label}
            <input
                type={type}
                required={required}
                disabled={disabled}
                max={type === "date" ? new Date().toISOString().slice(0, 10) : undefined}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"
            />
            {error && <span className="mt-1 block text-sm font-normal text-red-600">{error}</span>}
        </label>
    );
}

function StaffCard({ member }: { member: StaffMember }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <UserCog />
                </div>
                <div>
                    <h2 className="font-bold">{member.name}</h2>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        Barangay Secretary
                    </p>
                </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {member.email}
                </p>
                <p className="text-sm">{member.contact_number ?? "No phone number provided"}</p>
                <p className="text-xs">
                    Account created{" "}
                    {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                    }).format(new Date(member.created_at))}
                </p>
            </div>
        </div>
    );
}
