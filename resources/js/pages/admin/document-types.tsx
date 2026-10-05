import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Plus, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type DocumentType = {
    id: number;
    name: string;
    description: string | null;
    fee: string | number;
    is_active: boolean;
};

export default function DocumentTypesPage({
    documents,
}: {
    documents: DocumentType[];
}) {
    const [adding, setAdding] = useState(false);
    const form = useForm({
        name: '',
        description: '',
        fee: '0',
        is_active: true,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post('/admin/document-types', {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setAdding(false);
            },
        });
    };

    return (
        <>
            <Head title="Document Types" />
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
                            <h1 className="text-2xl font-bold md:text-3xl">
                                Document Types
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Add document services, set fees, and control
                                which documents residents can request.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setAdding((value) => !value)}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                            {adding ? (
                                <X className="h-4 w-4" />
                            ) : (
                                <Plus className="h-4 w-4" />
                            )}
                            {adding ? 'Cancel' : 'Add Document'}
                        </button>
                    </div>

                    {adding && (
                        <form
                            onSubmit={submit}
                            className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 dark:border-slate-800 dark:bg-slate-900"
                        >
                            <label className="block text-sm font-semibold">
                                Document name
                                <input
                                    required
                                    maxLength={255}
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"
                                />
                                {form.errors.name && (
                                    <ErrorText>{form.errors.name}</ErrorText>
                                )}
                            </label>
                            <label className="block text-sm font-semibold">
                                Fee (PHP)
                                <input
                                    required
                                    type="number"
                                    min="0"
                                    max="999999.99"
                                    step="0.01"
                                    value={form.data.fee}
                                    onChange={(event) =>
                                        form.setData('fee', event.target.value)
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"
                                />
                                {form.errors.fee && (
                                    <ErrorText>{form.errors.fee}</ErrorText>
                                )}
                            </label>
                            <label className="block text-sm font-semibold md:col-span-2">
                                Description
                                <textarea
                                    rows={3}
                                    maxLength={2000}
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal dark:border-slate-700 dark:bg-slate-950"
                                />
                                {form.errors.description && (
                                    <ErrorText>
                                        {form.errors.description}
                                    </ErrorText>
                                )}
                            </label>
                            <label className="flex items-center gap-3 text-sm font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.data.is_active}
                                    onChange={(event) =>
                                        form.setData(
                                            'is_active',
                                            event.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 accent-emerald-600"
                                />
                                Available for resident requests
                            </label>
                            <div className="md:col-span-2">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {form.processing
                                        ? 'Adding document…'
                                        : 'Add document type'}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        {documents.map((document) => (
                            <DocumentTypeCard
                                key={document.id}
                                document={document}
                            />
                        ))}
                        {documents.length === 0 && (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900">
                                No document types added yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function DocumentTypeCard({ document }: { document: DocumentType }) {
    const form = useForm({
        name: document.name,
        description: document.description ?? '',
        fee: String(document.fee),
        is_active: document.is_active,
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.patch(`/admin/document-types/${document.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <form
            onSubmit={submit}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
            <div className="mb-4 flex items-start gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                    <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                        Document type #{document.id}
                    </p>
                    <p className="mt-1 text-sm font-semibold">
                        Current fee: {formatFee(document.fee)}
                    </p>
                </div>
            </div>

            <label className="block text-sm font-semibold">
                Name
                <input
                    required
                    maxLength={255}
                    value={form.data.name}
                    onChange={(event) =>
                        form.setData('name', event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-950"
                />
                {form.errors.name && <ErrorText>{form.errors.name}</ErrorText>}
            </label>

            <label className="mt-3 block text-sm font-semibold">
                Description
                <textarea
                    rows={2}
                    maxLength={2000}
                    value={form.data.description}
                    onChange={(event) =>
                        form.setData('description', event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-950"
                />
                {form.errors.description && (
                    <ErrorText>{form.errors.description}</ErrorText>
                )}
            </label>

            <label className="mt-3 block text-sm font-semibold">
                Fee (PHP)
                <input
                    required
                    type="number"
                    min="0"
                    max="999999.99"
                    step="0.01"
                    value={form.data.fee}
                    onChange={(event) =>
                        form.setData('fee', event.target.value)
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-normal dark:border-slate-700 dark:bg-slate-950"
                />
                {form.errors.fee && <ErrorText>{form.errors.fee}</ErrorText>}
            </label>

            <label className="mt-4 flex items-center gap-2 text-sm font-medium">
                <input
                    type="checkbox"
                    checked={form.data.is_active}
                    onChange={(event) =>
                        form.setData('is_active', event.target.checked)
                    }
                    className="h-4 w-4 accent-emerald-600"
                />
                Available for resident requests
            </label>

            {form.errors.is_active && (
                <ErrorText>{form.errors.is_active}</ErrorText>
            )}
            <button
                type="submit"
                disabled={form.processing || !form.isDirty}
                className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {form.processing ? 'Saving…' : 'Save changes'}
            </button>
            {form.recentlySuccessful && (
                <span className="ml-3 text-sm text-emerald-700">Saved</span>
            )}
        </form>
    );
}

function ErrorText({ children }: { children: string }) {
    return (
        <span className="mt-1 block text-sm font-normal text-red-600">
            {children}
        </span>
    );
}

function formatFee(fee: string | number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(Number(fee));
}
