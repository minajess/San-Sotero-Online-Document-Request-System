import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DocumentRequestTable, {
    type DocumentRequestRow,
} from '@/components/document-request-table';

export default function AdminRequestsPage({
    requests,
}: {
    requests: DocumentRequestRow[];
}) {
    return (
        <>
            <Head title="Document Requests" />
            <div className="w-full min-w-0 space-y-6">
                <div>
                    <Link
                        href="/admin/dashboard"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Admin dashboard
                    </Link>
                    <h1 className="text-3xl font-black">Document requests</h1>
                    <p className="mt-2 text-slate-500">
                        Monitor request status, resident details, claim
                        schedules, and payment records.
                    </p>
                </div>
                <DocumentRequestTable requests={requests} showRequesterSearch={false} />
            </div>
        </>
    );
}
