'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { Genre, Rayon, SortLivres } from '@/lib/data';
import {
    pill,
    pillHighlight,
    SelectField,
    FilterBadge,
} from '@/components/ui/filter';

const SORTS: { value: SortLivres; label: string }[] = [
    { value: 'alpha', label: 'A → Z' },
    { value: 'date', label: 'Récents en premier' },
    { value: 'note', label: 'Mieux notés' },
    { value: 'prix-asc', label: 'Prix croissant' },
    { value: 'prix-desc', label: 'Prix décroissant' },
    { value: 'editeur', label: 'Éditeur' },
];

interface Props {
    rayons: Rayon[];
    genres: Genre[];
    series: string[];
    editeurs: string[];
    formats: string[];
    activeRayonId?: number;
    activeGenreId?: number;
    activeSerie?: string;
    activeEditeur?: string;
    activeFormat?: string;
    activeSort?: SortLivres;
    activeChoixLibrairie?: boolean;
}

export function FilterBar({
    rayons,
    genres,
    series,
    editeurs,
    formats,
    activeRayonId,
    activeGenreId,
    activeSerie,
    activeEditeur,
    activeFormat,
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
            router.push(`/livres${str ? `?${str}` : ''}`);
        },
        [router, searchParams],
    );

    const hasFilters =
        activeRayonId ||
        activeGenreId ||
        activeSerie ||
        activeEditeur ||
        activeFormat ||
        activeChoixLibrairie;

    return (
        <div className="space-y-5">
            {/* Rayons */}
            <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-muted">
                    Rayon
                </span>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() =>
                            push({ rayon: undefined, genre: undefined })
                        }
                        className={pill(!activeRayonId)}
                    >
                        Tous les rayons
                    </button>
                    {rayons.map((rayon) => (
                        <button
                            key={rayon.id}
                            onClick={() =>
                                push({
                                    rayon: String(rayon.id),
                                    genre: undefined,
                                })
                            }
                            className={pill(activeRayonId === rayon.id)}
                        >
                            {rayon.nom}
                        </button>
                    ))}
                </div>
            </div>

            {/* Genre + Choix */}
            <div className="space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() =>
                            push({
                                choix: activeChoixLibrairie ? undefined : '1',
                            })
                        }
                        className={pillHighlight(!!activeChoixLibrairie)}
                    >
                        Choix de la librairie
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] uppercase tracking-widest text-muted w-14 shrink-0">
                        Genre
                    </span>
                    <button
                        onClick={() => push({ genre: undefined })}
                        className={pill(!activeGenreId)}
                    >
                        Tous
                    </button>
                    {genres.map((genre) => (
                        <button
                            key={genre.id}
                            onClick={() => push({ genre: String(genre.id) })}
                            className={pill(activeGenreId === genre.id)}
                        >
                            {genre.nom}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap gap-3 items-end">
                {series.length > 0 && (
                    <SelectField
                        label="Série"
                        value={activeSerie ?? ''}
                        onChange={(val) => push({ serie: val || undefined })}
                        options={series.map((serie) => ({
                            value: serie,
                            label: serie,
                        }))}
                        placeholder="Toutes"
                    />
                )}
                {editeurs.length > 1 && (
                    <SelectField
                        label="Éditeur"
                        value={activeEditeur ?? ''}
                        onChange={(val) => push({ editeur: val || undefined })}
                        options={editeurs.map((editeur) => ({
                            value: editeur,
                            label: editeur,
                        }))}
                        placeholder="Tous"
                    />
                )}
                {formats.length > 1 && (
                    <SelectField
                        label="Format"
                        value={activeFormat ?? ''}
                        onChange={(val) => push({ format: val || undefined })}
                        options={formats.map((format) => ({
                            value: format,
                            label:
                                format.charAt(0).toUpperCase() +
                                format.slice(1),
                        }))}
                        placeholder="Tous"
                    />
                )}
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
                    {activeRayonId && (
                        <FilterBadge
                            label={
                                rayons.find(
                                    (rayon) => rayon.id === activeRayonId,
                                )?.nom ?? 'Rayon'
                            }
                            onRemove={() => push({ rayon: undefined })}
                        />
                    )}
                    {activeGenreId && (
                        <FilterBadge
                            label={
                                genres.find(
                                    (genre) => genre.id === activeGenreId,
                                )?.nom ?? 'Genre'
                            }
                            onRemove={() => push({ genre: undefined })}
                        />
                    )}
                    {activeSerie && (
                        <FilterBadge
                            label={activeSerie}
                            onRemove={() => push({ serie: undefined })}
                        />
                    )}
                    {activeEditeur && (
                        <FilterBadge
                            label={activeEditeur}
                            onRemove={() => push({ editeur: undefined })}
                        />
                    )}
                    {activeFormat && (
                        <FilterBadge
                            label={
                                activeFormat.charAt(0).toUpperCase() +
                                activeFormat.slice(1)
                            }
                            onRemove={() => push({ format: undefined })}
                        />
                    )}
                    <button
                        onClick={() => router.push('/livres')}
                        className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors ml-2 underline underline-offset-2"
                    >
                        Tout effacer
                    </button>
                </div>
            )}
        </div>
    );
}
