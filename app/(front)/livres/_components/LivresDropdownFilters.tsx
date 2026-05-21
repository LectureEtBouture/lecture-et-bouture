'use client';

import { useSearchParams } from 'next/navigation';
import type { SortLivres } from '@/lib/queries/livres';
import { SelectField } from '@/components/ui/filter';

const SORTS_SEARCH: { value: SortLivres; label: string }[] = [
    { value: 'relevance', label: 'Pertinence' },
    { value: 'newest', label: 'Récents en premier' },
];

const SORTS_CATALOGUE: { value: SortLivres; label: string }[] = [
    { value: 'alpha', label: 'A → Z' },
    { value: 'date', label: 'Récents en premier' },
    { value: 'note', label: 'Mieux notés' },
    { value: 'prix-asc', label: 'Prix croissant' },
    { value: 'prix-desc', label: 'Prix décroissant' },
];

function toggleClass(active: boolean) {
    return `px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border transition-colors ${active ? 'bg-primary border-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`;
}

export function LivresDropdownFilters({
    activeSort,
    activeEbook,
    push,
}: {
    activeSort?: SortLivres;
    activeEbook?: boolean;
    push: (updates: Record<string, string | undefined>) => void;
}) {
    const searchParams = useSearchParams();
    const q = searchParams.get('q');

    const sorts = q ? SORTS_SEARCH : SORTS_CATALOGUE;

    return (
        <div className="flex flex-wrap gap-3 items-end">
            <SelectField
                label="Trier par"
                value={activeSort ?? ''}
                onChange={(val) => push({ sort: val || undefined })}
                options={sorts.map((sort) => ({ value: sort.value, label: sort.label }))}
                placeholder="Par défaut"
            />
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest text-muted opacity-0 select-none">
                    &nbsp;
                </span>
                <button
                    type="button"
                    onClick={() => push({ ebook: activeEbook ? undefined : '1' })}
                    className={toggleClass(!!activeEbook)}
                >
                    Ebooks
                </button>
            </div>
        </div>
    );
}
