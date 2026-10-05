import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import DocumentRequestTable, {
    type DocumentRequestRow,
} from '@/components/document-request-table';

export default function ResidentRequestsPage({
    requests,
}: {
    requests: DocumentRequestRow[];
}) {
    return (
        <>
            <Head title="My Document Requests" />
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <Link
                            href="/resident/dashboard"
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <h1 className="text-3xl font-black">My requests</h1>
                        <p className="mt-2 text-slate-500">
                            Current status, claim schedule, and payment details.
                        </p>
                    </div>
                    <Link
                        href="/resident/request"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        New request
                    </Link>
                </div>
                <DocumentRequestTable requests={requests} />
            </div>
        </>
    );
}
