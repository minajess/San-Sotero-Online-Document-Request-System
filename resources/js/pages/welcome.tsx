import { Head, Link, usePage } from "@inertiajs/react";
import {
    ArrowRight,
    Bell,
    CheckCircle2,
    FileCheck2,
    FileText,
    Menu,
    ShieldCheck,
    UserRound,
    X,
} from "lucide-react";
import { useState } from "react";

type ContentItem = {
    title: string;
    description: string;
};

type LandingSection = {
    enabled: boolean;
    [key: string]: unknown;
};

type LandingPageContent = {
    site_name: string;
    logo_image: string;
    hero_image: string;
    navigation: { label: string; href: string }[];
    login_label: string;
    dashboard_label: string;
    footer_left: string;
    footer_right: string;
    section_order: ("hero" | "services" | "process" | "about" | "cta")[];
    sections: {
        hero: LandingSection & {
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
        services: LandingSection & {
            eyebrow: string;
            title: string;
            description: string;
            items: ContentItem[];
        };
        process: LandingSection & { eyebrow: string; title: string; items: ContentItem[] };
        about: LandingSection & {
            eyebrow: string;
            title: string;
            description: string;
            features: string[];
        };
        cta: LandingSection & {
            title: string;
            description: string;
            button_label: string;
            button_link: string;
        };
    };
};

type PageProps = {
    auth: { user: null | { role: string } };
    landingPage: LandingPageContent;
};

const serviceIcons = [FileText, FileCheck2, ShieldCheck];

export default function Welcome() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { auth, landingPage } = usePage<PageProps>().props;
    const requestDocumentUrl = auth.user
        ? auth.user.role === "resident"
            ? "/resident/request"
            : "/dashboard"
        : "/register";

    const sections = {
        hero: (
            <HeroSection
                content={landingPage.sections.hero}
                image={landingPage.hero_image}
                logo={landingPage.logo_image}
                requestUrl={requestDocumentUrl}
            />
        ),
        services: <ServicesSection content={landingPage.sections.services} />,
        process: <ProcessSection content={landingPage.sections.process} />,
        about: <AboutSection content={landingPage.sections.about} />,
        cta: <CtaSection content={landingPage.sections.cta} />,
    };

    return (
        <>
            <Head title={landingPage.site_name} />
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
                        <a href="/" className="flex items-center gap-3">
                            <img
                                src={landingPage.logo_image}
                                alt={landingPage.site_name}
                                className="h-12 w-12 rounded-full border-2 border-emerald-100 object-cover"
                            />
                            <p className="font-bold text-slate-900">{landingPage.site_name}</p>
                        </a>
                        <nav className="hidden items-center gap-8 md:flex">
                            {landingPage.navigation.map((item) => (
                                <a
                                    key={`${item.label}-${item.href}`}
                                    href={item.href}
                                    className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
                                >
                                    {item.label}
                                </a>
                            ))}
                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                                >
                                    {landingPage.dashboard_label}
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                                >
                                    {landingPage.login_label}
                                </Link>
                            )}
                        </nav>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="rounded-lg p-2 md:hidden"
                            aria-label="Toggle navigation"
                        >
                            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                    {mobileOpen && (
                        <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
                            <div className="flex flex-col gap-4">
                                {landingPage.navigation.map((item) => (
                                    <a
                                        key={`${item.label}-${item.href}`}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                <Link
                                    href={auth.user ? "/dashboard" : "/login"}
                                    className="rounded-xl bg-emerald-600 px-5 py-3 text-center font-semibold text-white"
                                >
                                    {auth.user
                                        ? landingPage.dashboard_label
                                        : landingPage.login_label}
                                </Link>
                            </div>
                        </div>
                    )}
                </header>

                <main>
                    {landingPage.section_order.map((key) => {
                        const section = landingPage.sections[key];
                        return section.enabled ? <div key={key}>{sections[key]}</div> : null;
                    })}
                </main>

                <footer className="border-t border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
                        <p>
                            © {new Date().getFullYear()} {landingPage.site_name}.{" "}
                            {landingPage.footer_left}
                        </p>
                        <p>{landingPage.footer_right}</p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function HeroSection({
    content,
    image,
    logo,
    requestUrl,
}: {
    content: LandingPageContent["sections"]["hero"];
    image: string;
    logo: string;
    requestUrl: string;
}) {
    return (
        <section
            id="home"
            className="overflow-hidden bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(100deg, rgba(2, 44, 34, 0.92) 0%, rgba(15, 23, 42, 0.76) 58%, rgba(15, 23, 42, 0.42) 100%), url('${image}')`,
            }}
        >
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
                <div>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        {content.badge}
                    </div>
                    <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {content.title}
                        <span className="block text-emerald-300">{content.highlight}</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg leading-8 text-white/85">
                        {content.description}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <a
                            href={content.primary_link || requestUrl}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
                        >
                            {content.primary_label}
                            <ArrowRight className="h-5 w-5" />
                        </a>
                        <a
                            href={content.secondary_link}
                            className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                        >
                            {content.secondary_label}
                        </a>
                    </div>
                    <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/85">
                        {content.highlights.map((highlight) => (
                            <span key={highlight} className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                                {highlight}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
                    <div className="relative rounded-[2rem] border border-white/25 bg-slate-950/30 p-6 text-white shadow-2xl backdrop-blur-md">
                        <div className="rounded-3xl border border-white/15 bg-emerald-900/75 p-8 text-white shadow-inner backdrop-blur-sm">
                            <img
                                src={logo}
                                alt=""
                                className="mx-auto h-28 w-28 rounded-full border-4 border-white/30 object-cover"
                            />
                            <div className="mt-6 text-center">
                                <p className="text-sm font-medium tracking-[0.2em] text-emerald-100 uppercase">
                                    {content.panel_eyebrow}
                                </p>
                                <h2 className="mt-2 text-3xl font-black">{content.panel_title}</h2>
                                <p className="mt-3 text-emerald-100">{content.panel_description}</p>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-4">
                            {content.panel_items.map((item, index) => (
                                <div
                                    key={item}
                                    className="rounded-2xl border border-white/15 bg-white/10 p-4"
                                >
                                    {index === 0 ? (
                                        <FileText className="h-6 w-6 text-emerald-200" />
                                    ) : (
                                        <Bell className="h-6 w-6 text-emerald-200" />
                                    )}
                                    <p className="mt-3 text-sm font-semibold text-white">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ServicesSection({ content }: { content: LandingPageContent["sections"]["services"] }) {
    return (
        <section id="services" className="bg-white py-20">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="font-semibold text-emerald-600">{content.eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                        {content.title}
                    </h2>
                    <p className="mt-4 text-slate-600">{content.description}</p>
                </div>
                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {content.items.map((item, index) => {
                        const Icon = serviceIcons[index % serviceIcons.length];
                        return (
                            <div
                                key={`${item.title}-${index}`}
                                className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                                    <Icon className="h-7 w-7 text-emerald-600" />
                                </div>
                                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                                <p className="mt-3 leading-7 text-slate-600">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function ProcessSection({ content }: { content: LandingPageContent["sections"]["process"] }) {
    return (
        <section id="how-it-works" className="bg-slate-50 py-20">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="text-center">
                    <p className="font-semibold text-emerald-600">{content.eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-black sm:text-4xl">{content.title}</h2>
                </div>
                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {content.items.map((item, index) => (
                        <div
                            key={`${item.title}-${index}`}
                            className="relative rounded-2xl bg-white p-6 shadow-sm"
                        >
                            <span className="text-4xl font-black text-emerald-100">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="mt-4 text-lg font-bold">{item.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function AboutSection({ content }: { content: LandingPageContent["sections"]["about"] }) {
    const featureIcons = [UserRound, ShieldCheck];
    return (
        <section id="about" className="bg-white py-20">
            <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2 lg:px-8">
                <div>
                    <p className="font-semibold text-emerald-600">{content.eyebrow}</p>
                    <h2 className="mt-2 text-3xl font-black sm:text-4xl">{content.title}</h2>
                </div>
                <div>
                    <p className="leading-8 text-slate-600">{content.description}</p>
                    <div className="mt-7 grid grid-cols-2 gap-4">
                        {content.features.map((feature, index) => {
                            const Icon = featureIcons[index] ?? ShieldCheck;
                            return (
                                <div key={feature} className="rounded-2xl bg-slate-50 p-5">
                                    <Icon className="h-7 w-7 text-emerald-600" />
                                    <p className="mt-3 font-bold">{feature}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

function CtaSection({ content }: { content: LandingPageContent["sections"]["cta"] }) {
    return (
        <section className="px-5 py-20">
            <div className="mx-auto max-w-6xl rounded-[2rem] bg-emerald-700 px-6 py-14 text-center text-white sm:px-12">
                <h2 className="text-3xl font-black sm:text-4xl">{content.title}</h2>
                <p className="mx-auto mt-4 max-w-xl text-emerald-100">{content.description}</p>
                <a
                    href={content.button_link}
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-emerald-700 transition hover:bg-emerald-50"
                >
                    {content.button_label}
                    <ArrowRight className="h-5 w-5" />
                </a>
            </div>
        </section>
    );
}
