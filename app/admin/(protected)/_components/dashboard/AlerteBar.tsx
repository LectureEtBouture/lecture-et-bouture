import Link from 'next/link';

interface Alerte {
    label: string;
    count: number;
    href: string;
}

export function AlerteBar({ alertes }: { alertes: Alerte[] }) {
    const actives = alertes.filter((a) => a.count > 0);
    if (actives.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-1">
            <span className="text-[10px] uppercase tracking-[0.12em] text-amber-700 font-medium shrink-0">
                À traiter
            </span>
            {actives.map((alerte) => (
                <Link
                    key={alerte.href}
                    href={alerte.href}
                    className="text-sm text-amber-800 hover:text-amber-900 transition-colors"
                >
                    <span className="font-serif font-bold">{alerte.count}</span>{' '}
                    {alerte.label}
                </Link>
            ))}
        </div>
    );
}
