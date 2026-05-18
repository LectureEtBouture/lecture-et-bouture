'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
    DIFFICULTE_LABELS,
    LUMIERE_LABELS,
    ARROSAGE_LABELS,
    type SortBoutures,
} from '@/lib/data';
import {
    pill,
    pillHighlight,
    SelectField,
    FilterBadge,
} from '@/components/ui/filter';

const SORTS: { value: SortBoutures; label: string }[] = [
    { value: 'alpha', label: 'A → Z' },
    { value: 'note', label: 'Mieux notées' },
    { value: 'prix-asc', label: 'Prix croissant' },
    { value: 'prix-desc', label: 'Prix décroissant' },
    { value: 'difficulte', label: 'Difficulté' },
];

const DIFFICULTES = Object.entries(DIFFICULTE_LABELS);
const LUMIERES = Object.entries(LUMIERE_LABELS);
const ARROSAGES = Object.entries(ARROSAGE_LABELS);

interface Props {
    activeDifficulte?: string;
    activeLumiere?: string;
    activeArrosage?: string;
    activeSort?: SortBoutures;
    activeChoixLibrairie?: boolean;
}

export function BouturesFilterBar({
    activeDifficulte,
    activeLumiere,
    activeArrosage,
    activeSort,
    activeChoixLibrairie,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const push = useCallback(
        (updates: Record<string, string | undefined>) => {
            const next = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(updates)) {
                if (value === undefined || value === '') next.delete(key);
                else next.set(key, value);
            }
            const str = next.toString();
            router.push(`/boutures${str ? `?${str}` : ''}`);
        },
        [router, searchParams],
    );

    const hasFilters =
        activeDifficulte ||
        activeLumiere ||
        activeArrosage ||
        activeChoixLibrairie;

    return (
        <div className="space-y-5">
            {/* Difficulté */}
            <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-muted">
                    Difficulté
                </span>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => push({ difficulte: undefined })}
                        className={pill(!activeDifficulte)}
                    >
                        Toutes
                    </button>
                    {DIFFICULTES.map(([value, label]) => (
                        <button
                            key={value}
                            onClick={() => push({ difficulte: value })}
                            className={pill(activeDifficulte === value)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Choix + dropdowns */}
            <div className="space-y-3">
                <button
                    onClick={() =>
                        push({ choix: activeChoixLibrairie ? undefined : '1' })
                    }
                    className={pillHighlight(!!activeChoixLibrairie)}
                >
                    Choix de la librairie
                </button>

                <div className="flex flex-wrap gap-3 items-end">
                    <SelectField
                        label="Lumière"
                        value={activeLumiere ?? ''}
                        onChange={(val) => push({ lumiere: val || undefined })}
                        options={LUMIERES.map(([value, label]) => ({
                            value,
                            label,
                        }))}
                        placeholder="Toutes"
                    />
                    <SelectField
                        label="Arrosage"
                        value={activeArrosage ?? ''}
                        onChange={(val) => push({ arrosage: val || undefined })}
                        options={ARROSAGES.map(([value, label]) => ({
                            value,
                            label,
                        }))}
                        placeholder="Tous"
                    />
                    <div className="w-px self-stretch bg-border hidden sm:block" />
                    <SelectField
                        label="Trier par"
                        value={activeSort ?? ''}
                        onChange={(val) => push({ sort: val || undefined })}
                        options={SORTS.map((sort) => ({
                            value: sort.value,
                            label: sort.label,
                        }))}
                        placeholder="Par défaut"
                    />
                </div>
            </div>

            {/* Filtres actifs */}
            {hasFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase tracking-widest text-muted">
                        Filtres actifs
                    </span>
                    {activeChoixLibrairie && (
                        <FilterBadge
                            label="Choix de la librairie"
                            onRemove={() => push({ choix: undefined })}
                        />
                    )}
                    {activeDifficulte && (
                        <FilterBadge
                            label={
                                DIFFICULTE_LABELS[activeDifficulte] ??
                                activeDifficulte
                            }
                            onRemove={() => push({ difficulte: undefined })}
                        />
                    )}
                    {activeLumiere && (
                        <FilterBadge
                            label={
                                LUMIERE_LABELS[activeLumiere] ?? activeLumiere
                            }
                            onRemove={() => push({ lumiere: undefined })}
                        />
                    )}
                    {activeArrosage && (
                        <FilterBadge
                            label={
                                ARROSAGE_LABELS[activeArrosage] ??
                                activeArrosage
                            }
                            onRemove={() => push({ arrosage: undefined })}
                        />
                    )}
                    <button
                        onClick={() => router.push('/boutures')}
                        className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors ml-2 underline underline-offset-2"
                    >
                        Tout effacer
                    </button>
                </div>
            )}
        </div>
    );
}
