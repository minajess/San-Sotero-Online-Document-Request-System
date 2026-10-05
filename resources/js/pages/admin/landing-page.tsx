import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type ContentItem = { title: string; description: string };
type SectionKey = "hero" | "services" | "process" | "about" | "cta";
type LandingPageContent = {
    site_name: string;
    logo_image: string;
    hero_image: string;
    navigation: { label: string; href: string }[];
    login_label: string;
    dashboard_label: string;
    footer_left: string;
    footer_right: string;
    section_order: SectionKey[];
    sections: {
        hero: {
            enabled: boolean;
            badge: string;
            title: string;
            highlight: string;
            description: string;
            primary_label: string;
            primary_link: string | null;
            secondary_label: string;
            secondary_link: string;
            highlights: string[];
            panel_eyebrow: string;
            panel_title: string;
            panel_description: string;
            panel_items: string[];
        };
        services: {
            enabled: boolean;
            eyebrow: string;
            title: string;
            description: string;
            items: ContentItem[];
        };
        process: { enabled: boolean; eyebrow: string; title: string; items: ContentItem[] };
        about: {
            enabled: boolean;
            eyebrow: string;
            title: string;
            description: string;
            features: string[];
        };
        cta: {
            enabled: boolean;
            title: string;
            description: string;
            button_label: string;
            button_link: string;
        };
    };
};

type FormData = {
    content: LandingPageContent;
    logo_image: File | null;
    hero_image: File | null;
};

type PageProps = { landingPage: LandingPageContent };

const sectionLabels: Record<SectionKey, string> = {
    hero: "Hero banner",
    services: "Services",
    process: "How it works",
    about: "About",
    cta: "Call to action",
};

export default function LandingPageEditor() {
    const { landingPage } = usePage<PageProps>().props;
    const form = useForm<FormData>({
        content: landingPage,
        logo_image: null,
        hero_image: null,
    });

    useEffect(() => {
        form.setData((data) => ({
            ...data,
            content: landingPage,
            logo_image: null,
            hero_image: null,
        }));
    }, [landingPage]);

    const updateSection = <K extends SectionKey>(
        key: K,
        updates: Partial<LandingPageContent["sections"][K]>,
    ) => {
        form.setData("content", {
            ...form.data.content,
            sections: {
                ...form.data.content.sections,
                [key]: { ...form.data.content.sections[key], ...updates },
            },
        });
    };

    const updateService = (index: number, updates: Partial<ContentItem>) => {
        const items = form.data.content.sections.services.items.map((item, itemIndex) =>
            itemIndex === index ? { ...item, ...updates } : item,
        );
        updateSection("services", { items });
    };

    const updateStep = (index: number, updates: Partial<ContentItem>) => {
        const items = form.data.content.sections.process.items.map((item, itemIndex) =>
            itemIndex === index ? { ...item, ...updates } : item,
        );
        updateSection("process", { items });
    };

    const updateNavigation = (
        index: number,
        updates: Partial<LandingPageContent["navigation"][number]>,
    ) => {
        const navigation = form.data.content.navigation.map((item, itemIndex) =>
            itemIndex === index ? { ...item, ...updates } : item,
        );
        form.setData("content", { ...form.data.content, navigation });
    };

    const moveSection = (index: number, direction: -1 | 1) => {
        const sectionOrder = [...form.data.content.section_order];
        const target = index + direction;
        [sectionOrder[index], sectionOrder[target]] = [sectionOrder[target], sectionOrder[index]];
        form.setData("content", { ...form.data.content, section_order: sectionOrder });
    };

    const submit = () => {
        form.put("/admin/landing-page", {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title="Edit Landing Page" />
            <div className="min-h-screen bg-slate-50 py-8 text-slate-900 dark:bg-slate-950 dark:text-white">
                <div className="mx-auto w-full max-w-none">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <Link
                                href="/admin/dashboard"
                                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400"
                            >
                                <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold">Edit Landing Page</h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Update the public website content, images, links, and section order.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href="/"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                            >
                                <Eye className="h-4 w-4" /> View Website
                            </a>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={form.processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />{" "}
                                {form.processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>

                    {Object.keys(form.errors).length > 0 && (
                        <div
                            role="alert"
                            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                        >
                            Some fields need attention. Check the highlighted validation message
                            below each section.
                            <ul className="mt-2 list-inside list-disc">
                                {Object.entries(form.errors)
                                    .slice(0, 5)
                                    .map(([field, message]) => (
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

                    <div className="space-y-6">
                        <Panel
                            title="Branding and Navigation"
                            description="Change the site name, logo, menu text, and destination links."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Website / Barangay name"
                                    value={form.data.content.site_name}
                                    onChange={(site_name) =>
                                        form.setData("content", { ...form.data.content, site_name })
                                    }
                                />
                                <ImageUpload
                                    label="Logo image"
                                    file={form.data.logo_image}
                                    currentImage={form.data.content.logo_image}
                                    onChange={(logo_image) =>
                                        form.setData("logo_image", logo_image)
                                    }
                                />
                            </div>
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                {form.data.content.navigation.map((item, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950 sm:grid-cols-2"
                                    >
                                        <TextField
                                            label={`Menu ${index + 1} label`}
                                            value={item.label}
                                            onChange={(label) => updateNavigation(index, { label })}
                                        />
                                        <TextField
                                            label="Link (URL or #section)"
                                            value={item.href}
                                            onChange={(href) => updateNavigation(index, { href })}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Login button label"
                                    value={form.data.content.login_label}
                                    onChange={(login_label) =>
                                        form.setData("content", {
                                            ...form.data.content,
                                            login_label,
                                        })
                                    }
                                />
                                <TextField
                                    label="Dashboard button label"
                                    value={form.data.content.dashboard_label}
                                    onChange={(dashboard_label) =>
                                        form.setData("content", {
                                            ...form.data.content,
                                            dashboard_label,
                                        })
                                    }
                                />
                            </div>
                        </Panel>

                        <Panel
                            title="Page Sections"
                            description="Choose which sections appear and use the arrows to change their order."
                        >
                            <div className="space-y-3">
                                {form.data.content.section_order.map((key, index) => (
                                    <div
                                        key={key}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-7 text-sm font-bold text-slate-400">
                                                {index + 1}.
                                            </span>
                                            <span className="font-semibold">
                                                {sectionLabels[key]}
                                            </span>
                                            <label className="ml-2 inline-flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        form.data.content.sections[key].enabled
                                                    }
                                                    onChange={(event) =>
                                                        updateSection(key, {
                                                            enabled: event.target.checked,
                                                        })
                                                    }
                                                    className="rounded border-slate-300 text-emerald-600"
                                                />
                                                Visible
                                            </label>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                aria-label={`Move ${sectionLabels[key]} up`}
                                                disabled={index === 0}
                                                onClick={() => moveSection(index, -1)}
                                                className="rounded-lg border p-2 disabled:opacity-30 dark:border-slate-700"
                                            >
                                                <ArrowUp className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                aria-label={`Move ${sectionLabels[key]} down`}
                                                disabled={
                                                    index ===
                                                    form.data.content.section_order.length - 1
                                                }
                                                onClick={() => moveSection(index, 1)}
                                                className="rounded-lg border p-2 disabled:opacity-30 dark:border-slate-700"
                                            >
                                                <ArrowDown className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Panel>

                        <Panel
                            title="Hero Banner"
                            description="Edit the first section visitors see, its background, copy, and buttons."
                        >
                            <ImageUpload
                                label="Hero background image"
                                file={form.data.hero_image}
                                currentImage={form.data.content.hero_image}
                                onChange={(hero_image) => form.setData("hero_image", hero_image)}
                            />
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Badge text"
                                    value={form.data.content.sections.hero.badge}
                                    onChange={(badge) => updateSection("hero", { badge })}
                                />
                                <TextField
                                    label="Heading"
                                    value={form.data.content.sections.hero.title}
                                    onChange={(title) => updateSection("hero", { title })}
                                />
                                <TextField
                                    label="Highlighted heading"
                                    value={form.data.content.sections.hero.highlight}
                                    onChange={(highlight) => updateSection("hero", { highlight })}
                                />
                                <TextField
                                    label="Primary button label"
                                    value={form.data.content.sections.hero.primary_label}
                                    onChange={(primary_label) =>
                                        updateSection("hero", { primary_label })
                                    }
                                />
                                <TextField
                                    label="Primary button link (blank uses user-specific destination)"
                                    value={form.data.content.sections.hero.primary_link ?? ""}
                                    onChange={(value) =>
                                        updateSection("hero", { primary_link: value || null })
                                    }
                                />
                                <TextField
                                    label="Secondary button label"
                                    value={form.data.content.sections.hero.secondary_label}
                                    onChange={(secondary_label) =>
                                        updateSection("hero", { secondary_label })
                                    }
                                />
                                <TextField
                                    label="Secondary button link"
                                    value={form.data.content.sections.hero.secondary_link}
                                    onChange={(secondary_link) =>
                                        updateSection("hero", { secondary_link })
                                    }
                                />
                                <TextArea
                                    label="Description"
                                    value={form.data.content.sections.hero.description}
                                    onChange={(description) =>
                                        updateSection("hero", { description })
                                    }
                                />
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                {form.data.content.sections.hero.highlights.map(
                                    (highlight, index) => (
                                        <TextField
                                            key={index}
                                            label={`Highlight ${index + 1}`}
                                            value={highlight}
                                            onChange={(value) => {
                                                const highlights = [
                                                    ...form.data.content.sections.hero.highlights,
                                                ];
                                                highlights[index] = value;
                                                updateSection("hero", { highlights });
                                            }}
                                        />
                                    ),
                                )}
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Hero panel eyebrow"
                                    value={form.data.content.sections.hero.panel_eyebrow}
                                    onChange={(panel_eyebrow) =>
                                        updateSection("hero", { panel_eyebrow })
                                    }
                                />
                                <TextField
                                    label="Hero panel heading"
                                    value={form.data.content.sections.hero.panel_title}
                                    onChange={(panel_title) =>
                                        updateSection("hero", { panel_title })
                                    }
                                />
                                <TextField
                                    label="Hero panel description"
                                    value={form.data.content.sections.hero.panel_description}
                                    onChange={(panel_description) =>
                                        updateSection("hero", { panel_description })
                                    }
                                />
                                {form.data.content.sections.hero.panel_items.map((item, index) => (
                                    <TextField
                                        key={index}
                                        label={`Hero panel card ${index + 1}`}
                                        value={item}
                                        onChange={(value) => {
                                            const panel_items = [
                                                ...form.data.content.sections.hero.panel_items,
                                            ];
                                            panel_items[index] = value;
                                            updateSection("hero", { panel_items });
                                        }}
                                    />
                                ))}
                            </div>
                        </Panel>

                        <Panel
                            title="Services"
                            description="Edit the service heading and cards shown on the page."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Eyebrow"
                                    value={form.data.content.sections.services.eyebrow}
                                    onChange={(eyebrow) => updateSection("services", { eyebrow })}
                                />
                                <TextField
                                    label="Heading"
                                    value={form.data.content.sections.services.title}
                                    onChange={(title) => updateSection("services", { title })}
                                />
                                <TextArea
                                    label="Description"
                                    value={form.data.content.sections.services.description}
                                    onChange={(description) =>
                                        updateSection("services", { description })
                                    }
                                />
                            </div>
                            <div className="mt-5 space-y-4">
                                {form.data.content.sections.services.items.map((item, index) => (
                                    <ItemEditor
                                        key={index}
                                        number={index + 1}
                                        item={item}
                                        onChange={(updates) => updateService(index, updates)}
                                        onRemove={() =>
                                            updateSection("services", {
                                                items: form.data.content.sections.services.items.filter(
                                                    (_, itemIndex) => itemIndex !== index,
                                                ),
                                            })
                                        }
                                        canRemove={
                                            form.data.content.sections.services.items.length > 1
                                        }
                                    />
                                ))}
                                <AddButton
                                    onClick={() =>
                                        updateSection("services", {
                                            items: [
                                                ...form.data.content.sections.services.items,
                                                { title: "", description: "" },
                                            ],
                                        })
                                    }
                                    disabled={form.data.content.sections.services.items.length >= 6}
                                    label="Add service"
                                />
                            </div>
                        </Panel>

                        <Panel
                            title="How It Works"
                            description="Update the request process steps; add, remove, or edit cards."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Eyebrow"
                                    value={form.data.content.sections.process.eyebrow}
                                    onChange={(eyebrow) => updateSection("process", { eyebrow })}
                                />
                                <TextField
                                    label="Heading"
                                    value={form.data.content.sections.process.title}
                                    onChange={(title) => updateSection("process", { title })}
                                />
                            </div>
                            <div className="mt-5 space-y-4">
                                {form.data.content.sections.process.items.map((item, index) => (
                                    <ItemEditor
                                        key={index}
                                        number={index + 1}
                                        item={item}
                                        onChange={(updates) => updateStep(index, updates)}
                                        onRemove={() =>
                                            updateSection("process", {
                                                items: form.data.content.sections.process.items.filter(
                                                    (_, itemIndex) => itemIndex !== index,
                                                ),
                                            })
                                        }
                                        canRemove={
                                            form.data.content.sections.process.items.length > 1
                                        }
                                    />
                                ))}
                                <AddButton
                                    onClick={() =>
                                        updateSection("process", {
                                            items: [
                                                ...form.data.content.sections.process.items,
                                                { title: "", description: "" },
                                            ],
                                        })
                                    }
                                    disabled={form.data.content.sections.process.items.length >= 6}
                                    label="Add step"
                                />
                            </div>
                        </Panel>

                        <Panel
                            title="About"
                            description="Edit the system description and the two feature labels."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Eyebrow"
                                    value={form.data.content.sections.about.eyebrow}
                                    onChange={(eyebrow) => updateSection("about", { eyebrow })}
                                />
                                <TextField
                                    label="Heading"
                                    value={form.data.content.sections.about.title}
                                    onChange={(title) => updateSection("about", { title })}
                                />
                                <TextArea
                                    label="Description"
                                    value={form.data.content.sections.about.description}
                                    onChange={(description) =>
                                        updateSection("about", { description })
                                    }
                                />
                                {form.data.content.sections.about.features.map((feature, index) => (
                                    <TextField
                                        key={index}
                                        label={`Feature ${index + 1}`}
                                        value={feature}
                                        onChange={(value) => {
                                            const features = [
                                                ...form.data.content.sections.about.features,
                                            ];
                                            features[index] = value;
                                            updateSection("about", { features });
                                        }}
                                    />
                                ))}
                            </div>
                        </Panel>

                        <Panel
                            title="Call to Action and Footer"
                            description="Edit the final page prompt, its link, and footer content."
                        >
                            <div className="grid gap-4 md:grid-cols-2">
                                <TextField
                                    label="Call-to-action heading"
                                    value={form.data.content.sections.cta.title}
                                    onChange={(title) => updateSection("cta", { title })}
                                />
                                <TextField
                                    label="Button label"
                                    value={form.data.content.sections.cta.button_label}
                                    onChange={(button_label) =>
                                        updateSection("cta", { button_label })
                                    }
                                />
                                <TextField
                                    label="Button link"
                                    value={form.data.content.sections.cta.button_link}
                                    onChange={(button_link) =>
                                        updateSection("cta", { button_link })
                                    }
                                />
                                <TextArea
                                    label="Description"
                                    value={form.data.content.sections.cta.description}
                                    onChange={(description) =>
                                        updateSection("cta", { description })
                                    }
                                />
                                <TextField
                                    label="Footer text after site name"
                                    value={form.data.content.footer_left}
                                    onChange={(footer_left) =>
                                        form.setData("content", {
                                            ...form.data.content,
                                            footer_left,
                                        })
                                    }
                                />
                                <TextField
                                    label="Footer right text"
                                    value={form.data.content.footer_right}
                                    onChange={(footer_right) =>
                                        form.setData("content", {
                                            ...form.data.content,
                                            footer_right,
                                        })
                                    }
                                />
                            </div>
                        </Panel>

                        <div className="flex justify-end pb-8">
                            <button
                                type="button"
                                onClick={submit}
                                disabled={form.processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                                <Save className="h-4 w-4" />{" "}
                                {form.processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

function Panel({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            {children}
        </section>
    );
}

function TextField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-sm font-medium">
            {label}
            <input
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
        </label>
    );
}

function TextArea({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <label className="block text-sm font-medium">
            {label}
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
            />
        </label>
    );
}

function ImageUpload({
    label,
    file,
    currentImage,
    onChange,
}: {
    label: string;
    file: File | null;
    currentImage: string;
    onChange: (file: File | null) => void;
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
                    <ImagePlus className="h-4 w-4" /> Browse
                </span>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => onChange(event.target.files?.[0] ?? null)}
                    className="sr-only"
                />
            </div>
        </label>
    );
}

function ItemEditor({
    number,
    item,
    onChange,
    onRemove,
    canRemove,
}: {
    number: number;
    item: ContentItem;
    onChange: (updates: Partial<ContentItem>) => void;
    onRemove: () => void;
    canRemove: boolean;
}) {
    return (
        <div className="grid gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-950 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <TextField
                label={`Card ${number} title`}
                value={item.title}
                onChange={(title) => onChange({ title })}
            />
            <TextArea
                label="Description"
                value={item.description}
                onChange={(description) => onChange({ description })}
            />
            <button
                type="button"
                aria-label={`Remove card ${number}`}
                disabled={!canRemove}
                onClick={onRemove}
                className="rounded-lg border border-slate-300 p-2 text-red-600 disabled:opacity-30 dark:border-slate-700"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );
}

function AddButton({
    onClick,
    disabled,
    label,
}: {
    onClick: () => void;
    disabled: boolean;
    label: string;
}) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-40 dark:text-emerald-400"
        >
            <Plus className="h-4 w-4" /> {label}
        </button>
    );
}
