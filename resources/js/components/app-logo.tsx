import { Link } from '@inertiajs/react';

export default function AppLogo() {
    return (
        <Link
            href="/"
            className="flex items-center gap-3"
        >
            <img
                src="/brgyLogo.png"
                alt="Barangay San Sotero"
                className="h-10 w-10 rounded-full border-2 border-emerald-100 object-cover"
            />

            <div className="hidden leading-tight sm:block">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                    Barangay
                </p>

                <p className="font-bold text-slate-900">
                    San Sotero
                </p>
            </div>
        </Link>
    );
}