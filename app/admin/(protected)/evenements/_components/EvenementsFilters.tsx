import Link from 'next/link';
import type {
    EvenementsFilter,
    EvenementsSort,
} from '@/lib/actions/evenements';

const FILTER_OPTIONS: { value: EvenementsFilter; label: string }[] = [
    { value: 'tous', label: 'Tous' },
    { value: 'a-venir', label: 'À venir' },
    { value: 'en-cours', label: 'En cours' },
    { value: 'passes', label: 'Passés' },
];

const SORT_OPTIONS: { value: EvenementsSort; label: string }[] = [
    { value: 'date-asc', label: 'Date ↑' },
    { value: 'date-desc', label: 'Date ↓' },
];

export function EvenementsFilters({
    filter,
    sort,
}: {
    filter: EvenementsFilter;
    sort: EvenementsSort;
}) {
    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
                {FILTER_OPTIONS.map((option) => (
                    <Link
                        key={option.value}
                        href={`/admin/evenements?filter=${option.value}&sort=${sort}`}
                        className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border transition-colors ${filter === option.value ? 'bg-primary border-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`}
                    >
                        {option.label}
                    </Link>
                ))}
            </div>
            <div className="flex items-center gap-1.5">
                {SORT_OPTIONS.map((option) => (
                    <Link
                        key={option.value}
                        href={`/admin/evenements?filter=${filter}&sort=${option.value}`}
                        className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border transition-colors ${sort === option.value ? 'bg-foreground border-foreground text-background' : 'border-border text-muted hover:border-foreground hover:text-foreground'}`}
                    >
                        {option.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
