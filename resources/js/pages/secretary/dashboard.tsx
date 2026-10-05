import { Head } from "@inertiajs/react";
import { CheckCircle2, Clock3, FileText, Users } from "lucide-react";
import DocumentRequestTable, { type DocumentRequestRow } from "@/components/document-request-table";

type Props = {
    statistics: {
        totalRequests: number;
        pendingRequests: number;
        processingRequests: number;
        totalResidents: number;
    };
    requests: DocumentRequestRow[];
};

export default function SecretaryDashboard({ statistics, requests }: Props) {
    return (
        <>
            <Head title="Secretary Dashboard" />
            <div className="w-full min-w-0 space-y-8">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-semibold text-emerald-600">Barangay Secretary</p>
                        <h1 className="mt-1 text-3xl font-black">Request management</h1>
                        <p className="mt-2 text-slate-500">
                            Review resident submissions, record payments, and set claim schedules.
                        </p>
                    </div>
                </header>

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Stat icon={FileText} label="Total requests" value={statistics.totalRequests} />
                    <Stat icon={Clock3} label="Pending" value={statistics.pendingRequests} />
                    <Stat
                        icon={CheckCircle2}
                        label="Processing"
                        value={statistics.processingRequests}
                    />
                    <Stat icon={Users} label="Residents" value={statistics.totalResidents} />
                </section>

                <section className="space-y-4">
                    <div>
                        <h2 className="text-xl font-bold">Recent document requests</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Latest requests submitted by residents.
                        </p>
                    </div>
                    <DocumentRequestTable requests={requests} />
                </section>
            </div>
        </>
    );
}

function Stat({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof FileText;
    label: string;
    value: number;
}) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-emerald-600" />
                <span className="text-2xl font-black">{value}</span>
            </div>
            <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
        </div>
    );
}
