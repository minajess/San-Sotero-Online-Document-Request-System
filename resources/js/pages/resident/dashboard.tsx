import { Head, Link } from "@inertiajs/react";
import { CheckCircle2, Clock3, FileCheck2, FileText, Plus } from "lucide-react";
import DocumentRequestTable, { type DocumentRequestRow } from "@/components/document-request-table";

type Props = {
    user: { name: string };
    statistics: {
        totalRequests: number;
        pendingRequests: number;
        processingRequests: number;
        readyRequests: number;
    };
    documentTypes: Array<{
        id: number;
        name: string;
        description: string | null;
        fee: string | number;
    }>;
    requests: DocumentRequestRow[];
};

export default function ResidentDashboard({ user, statistics, documentTypes, requests }: Props) {
    return (
        <>
            <Head title="Resident Dashboard" />
            <div className="space-y-8">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Resident Portal</p>
                        <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-slate-100">
                            Welcome back, {user.name}!
                        </h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">
                            Request barangay documents and track their progress.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/resident/request"
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700"
                        >
                            <Plus className="h-5 w-5" />
                            Request a document
                        </Link>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        icon={FileText}
                        label="Total requests"
                        value={statistics.totalRequests}
                    />
                    <StatCard icon={Clock3} label="Pending" value={statistics.pendingRequests} />
                    <StatCard
                        icon={FileCheck2}
                        label="Processing"
                        value={statistics.processingRequests}
                    />
                    <StatCard
                        icon={CheckCircle2}
                        label="Ready to claim"
                        value={statistics.readyRequests}
                    />
                </section>

                <section className="space-y-4">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold">Recent requests</h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Track your document requests and payment method.
                            </p>
                        </div>
                        <Link
                            href="/resident/requests"
                            className="text-sm font-semibold text-emerald-700 hover:underline"
                        >
                            View all
                        </Link>
                    </div>
                    <DocumentRequestTable requests={requests} showRequesterSearch={false} />
                    {requests.some((request) => request.status === "ready") && (
                        <p className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
                            Your document is ready to claim at BRGY HALL. Please visit to claim it
                            in person.
                        </p>
                    )}
                </section>

                <section>
                    <h2 className="text-xl font-bold">Available documents</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {documentTypes.map((document) => (
                            <Link
                                key={document.id}
                                href="/resident/request"
                                className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-emerald-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
                            >
                                <FileCheck2 className="h-6 w-6 text-emerald-600" />
                                <h3 className="mt-3 font-bold">{document.name}</h3>
                                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                    {document.description}
                                </p>
                                <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Fee: {formatFee(document.fee)}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FileText;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
                <span className="rounded-xl bg-emerald-50 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <Icon className="h-5 w-5" />
                </span>
                <span className="text-2xl font-black">{value}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        </div>
    );
}

function formatFee(fee: string | number): string {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
    }).format(Number(fee));
}
