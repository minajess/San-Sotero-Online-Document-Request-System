import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowLeft, Eye, ImagePlus, Save } from "lucide-react";
import { useEffect, useState } from "react";

type LandingPage = {
    logo_image: string;
    sections: {
        hero: {
            description: string;
        };
    };
};

type PageProps = { landingPage: LandingPage };

export default function LandingPageEditor() {
    const { landingPage } = usePage<PageProps>().props;
    const form = useForm<{
        welcome_message: string;
        logo_image: File | null;
    }>({
        welcome_message: landingPage.sections.hero.description,
        logo_image: null,
    });

    useEffect(() => {
        form.setData({
            welcome_message: landingPage.sections.hero.description,
            logo_image: null,
        });
    }, [landingPage]);

    const submit = () => {
        form.put("/admin/landing-page", {
            forceFormData: true,
            onSuccess: () => form.setData("logo_image", null),
        });
    };

    return (
        <>
            <Head title="Edit Landing Page" />
            <div className="min-h-screen bg-slate-50 py-8 text-slate-900 dark:bg-slate-950 dark:text-white">
                <div className="mx-auto w-full max-w-3xl px-4">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <Link
                                href="/admin/dashboard"
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold">Edit Landing Page</h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Update the public website logo and welcome message.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                            >
                                <Eye className="h-4 w-4" />
                                View Website
                            </a>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={form.processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />
                                {form.processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    {Object.keys(form.errors).length > 0 && (
                        <div
                            role="alert"
                            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                        >
                            Some fields need attention.
                            <ul className="mt-2 list-inside list-disc">
                                {Object.entries(form.errors).map(([field, message]) => (
                                    <li key={field}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {form.wasSuccessful && (
                        <p
                            role="status"
                            className="mb-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800"
                        >
                            Landing page changes saved successfully.
                        </p>
                    )}

                    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
                        <ImageUpload
                            label="Logo image"
                            file={form.data.logo_image}
                            currentImage={landingPage.logo_image}
                            onChange={(logo_image) => form.setData("logo_image", logo_image)}
                            error={form.errors.logo_image}
                        />
                        <label className="block text-sm font-medium">
                            Welcome message
                            <textarea
                                value={form.data.welcome_message}
                                maxLength={1000}
                                rows={5}
                                onChange={(event) =>
                                    form.setData("welcome_message", event.target.value)
                                }
                                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
                            />
                            {form.errors.welcome_message && (
                                <span className="mt-1 block text-sm text-red-600">
                                    {form.errors.welcome_message}
                                </span>
                            )}
                        </label>
                    </section>

                    <div className="mt-6 flex justify-end pb-8">
                        <button
                            type="button"
                            onClick={submit}
                            disabled={form.processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            <Save className="h-4 w-4" />
                            {form.processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

function ImageUpload({
    label,
    file,
    currentImage,
    onChange,
    error,
}: {
    label: string;
    file: File | null;
    currentImage: string;
    onChange: (file: File | null) => void;
    error?: string;
}) {
    const [preview, setPreview] = useState(currentImage);

    useEffect(() => {
        if (!file) {
            setPreview(currentImage);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [currentImage, file]);

    return (
        <label className="block text-sm font-medium">
            {label}
            <div className="mt-1.5 flex items-center gap-4 rounded-xl border border-slate-300 p-3 dark:border-slate-700">
                <img
                    src={preview}
                    alt={`${label} preview`}
                    className="h-16 w-16 rounded-lg object-cover"
                />
                <span className="flex-1 text-sm text-slate-500">
                    {file?.name ?? "Choose a new image (JPG, PNG, or WebP, up to 5 MB)"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold dark:bg-slate-800">
                    <ImagePlus className="h-4 w-4" />
                    Browse
                </span>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                    className="sr-only"
                />
            </div>
            {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
        </label>
    );
}
