import type { GenreFacette, RayonFacette } from '@/lib/queries/livres-facets';
import { FilterBadge } from '@/components/ui/filter';

export function LivresActiveFilters({
    rayons,
    genres,
    activeRayonId,
    activeGenreId,
    activeSerie,
    activeEditeur,
    activeFormat,
    activeChoixLibrairie,
    push,
    onReset,
}: {
    rayons: RayonFacette[];
    genres: GenreFacette[];
    activeRayonId?: string;
    activeGenreId?: string;
    activeSerie?: string;
    activeEditeur?: string;
    activeFormat?: string;
    activeChoixLibrairie?: boolean;
    push: (updates: Record<string, string | undefined>) => void;
    onReset: () => void;
}) {
    const hasFilters =
        activeRayonId ||
        activeGenreId ||
        activeSerie ||
        activeEditeur ||
        activeFormat ||
        activeChoixLibrairie;
    if (!hasFilters) return null;

    return (
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
                        rayons.find((rayon) => rayon.id === activeRayonId)
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
                onClick={onReset}
                className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors ml-2 underline underline-offset-2"
            >
                Tout effacer
            </button>
        </div>
    );
}
