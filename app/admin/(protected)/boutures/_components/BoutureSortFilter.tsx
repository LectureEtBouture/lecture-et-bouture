import Link from 'next/link';
import type { PlantesSort } from '@/lib/actions/plantes';

const SORT_OPTIONS: { value: PlantesSort; label: string }[] = [
    { value: 'recent', label: 'Récentes' },
    { value: 'nom', label: 'Nom A→Z' },
    { value: 'prix', label: 'Prix croissant' },
    { value: 'stock', label: 'Stock croissant' },
    { value: 'difficulte', label: 'Difficulté' },
];

const DIFFICULTE_OPTIONS = ['facile', 'moyen', 'difficile'] as const;
const DIFFICULTE_LABEL: Record<string, string> = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
};

function chip(active: boolean) {
    return `px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border transition-colors ${active ? 'bg-primary border-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`;
}

export function BoutureSortFilter({
    sort,
    choix,
    difficulte,
    buildHref,
}: {
    sort: PlantesSort;
    choix: boolean;
    difficulte?: string;
    buildHref: (params: Record<string, string | undefined>) => string;
}) {
    const base = {
        sort: sort !== 'recent' ? sort : undefined,
        choix: choix ? '1' : undefined,
        difficulte,
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted w-12 shrink-0">
                    Tri
                </span>
                {SORT_OPTIONS.map((option) => (
                    <Link
                        key={option.value}
                        href={buildHref({ ...base, sort: option.value })}
                        className={`${chip(sort === option.value)} shrink-0`}
                    >
                        {option.label}
                    </Link>
                ))}
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
                <span className="text-[10px] uppercase tracking-[0.1em] text-muted w-12 shrink-0">
                    Filtres
                </span>
                <Link
                    href={buildHref({
                        ...base,
                        choix: choix ? undefined : '1',
                    })}
                    className={`${chip(choix)} shrink-0`}
                >
                    Choix librairie
                </Link>
                {DIFFICULTE_OPTIONS.map((d) => (
                    <Link
                        key={d}
                        href={buildHref({
                            ...base,
                            difficulte: difficulte === d ? undefined : d,
                        })}
                        className={`${chip(difficulte === d)} shrink-0`}
                    >
                        {DIFFICULTE_LABEL[d]}
                    </Link>
                ))}
            </div>
        </div>
    );
}
