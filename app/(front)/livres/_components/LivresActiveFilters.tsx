'use client';

import type { GenreFacette, RayonFacette } from '@/lib/queries/livres-facets';
import { FilterBadge } from '@/components/ui/filter';
import { RAYON_SLUG_FR } from '@/lib/services/books/categories-fr';

export function LivresActiveFilters({
    rayons,
    genres,
    activeRayonId,
    activeGenreId,
    activeChoixLibrairie,
    activeCat,
    push,
    onReset,
}: {
    rayons: RayonFacette[];
    genres: GenreFacette[];
    activeRayonId?: string;
    activeGenreId?: string;
    activeChoixLibrairie?: boolean;
    activeCat?: string;
    push: (updates: Record<string, string | undefined>) => void;
    onReset: () => void;
}) {
    const hasFilters = activeRayonId || activeGenreId || activeChoixLibrairie || activeCat;
    if (!hasFilters) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-muted">
                Filtres actifs
            </span>
            {activeCat && (
                <FilterBadge
                    label={RAYON_SLUG_FR[activeCat] ?? activeCat}
                    onRemove={() => push({ cat: undefined })}
                />
            )}
            {activeChoixLibrairie && (
                <FilterBadge
                    label="Choix de la librairie"
                    onRemove={() => push({ choix: undefined })}
                />
            )}
            {activeRayonId && (
                <FilterBadge
                    label={
                        rayons.find((rayon) => rayon.slug === activeRayonId)
                            ?.nom ?? 'Rayon'
                    }
                    onRemove={() => push({ rayon: undefined })}
                />
            )}
            {activeGenreId && (
                <FilterBadge
                    label={
                        genres.find((genre) => genre.id === activeGenreId)
                            ?.nom ?? 'Genre'
                    }
                    onRemove={() => push({ genre: undefined })}
                />
            )}
            <button
                onClick={onReset}
                className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors ml-2 underline underline-offset-2"
            >
                Tout effacer
            </button>
        </div>
    );
}
