import Link from 'next/link';
import type { LivresSort } from '@/lib/actions/livres';
import type { InferSelectModel } from 'drizzle-orm';
import type { rayons } from '@/db/schema';

type Rayon = InferSelectModel<typeof rayons>;

const SORT_OPTIONS: { value: LivresSort; label: string }[] = [
    { value: 'recent', label: 'Récents' },
    { value: 'choix', label: 'Choix librairie' },
];

function chip(active: boolean) {
    return `px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border transition-colors ${active ? 'bg-primary border-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`;
}

export function LivresSortFilter({
    sort,
    choix,
    rayon,
    q,
    rayonsList,
    buildHref,
}: {
    sort: LivresSort;
    choix: boolean;
    rayon?: string;
    q?: string;
    rayonsList: Rayon[];
    buildHref: (params: Record<string, string | undefined>) => string;
}) {
    const base = {
        sort: sort !== 'recent' ? sort : undefined,
        choix: choix ? '1' : undefined,
        rayon,
        q,
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
                    Rayon
                </span>
                {rayonsList.map((r) => (
                    <Link
                        key={r.id}
                        href={buildHref({
                            ...base,
                            rayon: rayon === r.nom ? undefined : r.nom,
                        })}
                        className={`${chip(rayon === r.nom)} shrink-0`}
                    >
                        {r.nom}
                    </Link>
                ))}
            </div>
        </div>
    );
}
