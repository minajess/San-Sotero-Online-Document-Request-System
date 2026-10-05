import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Bell,
    Globe,
    Lock,
    Save,
    Settings as SettingsIcon,
    ShieldCheck,
} from 'lucide-react';

export default function SettingsPage() {
    return (
        <>
            <Head title="System Settings" />

            <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
                <div className="mx-auto w-full max-w-none">

                    <Link
                        href="/admin/dashboard"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="mb-6">
                        <h1 className="text-2xl font-bold md:text-3xl">
                            System Settings
                        </h1>

                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Configure the San Sotero document request system.
                        </p>
                    </div>

                    <div className="space-y-5">

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                                <div>
                                    <h2 className="font-bold">
                                        Barangay Information
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Basic information displayed throughout the system.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Barangay Name
                                    </label>

                                    <input
                                        defaultValue="Barangay San Sotero"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium">
                                        Municipality
                                    </label>

                                    <input
                                        placeholder="Enter municipality"
                                        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                                <div>
                                    <h2 className="font-bold">
                                        Notifications
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Configure system notifications.
                                    </p>
                                </div>
                            </div>

                            <label className="mt-5 flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    defaultChecked
                                    className="h-4 w-4 rounded border-slate-300 text-emerald-600"
                                />

                                <span className="text-sm">
                                    Notify residents when their request is ready.
                                </span>
                            </label>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />

                                <div>
                                    <h2 className="font-bold">
                                        Security
                                    </h2>

                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        System security configuration.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                                <div className="flex items-center gap-3">
                                    <Lock className="h-5 w-5 text-slate-500" />

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Role-based access control
                                        </p>

                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Enabled
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700">
                            <Save className="h-4 w-4" />
                            Save Settings
                        </button>

                    </div>
                </div>
            </div>
        </>
    );
}