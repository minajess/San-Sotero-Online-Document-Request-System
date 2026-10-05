import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import DocumentRequestTable, {
    type DocumentRequestRow,
} from '@/components/document-request-table';

export default function SecretaryRequestsPage({
    requests,
}: {
    requests: DocumentRequestRow[];
}) {
    return (
        <>
            <Head title="Process Document Requests" />
            <div className="w-full min-w-0 space-y-6">
                <div>
                    <Link
                        href="/secretary/dashboard"
                        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-700"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <h1 className="text-3xl font-black">
                        Process document requests
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Update status, schedule ready documents, and record cash
                        or GCash payments.
                    </p>
                </div>
                <DocumentRequestTable requests={requests} canProcess />
            </div>
        </>
    );
}
