import { DIFFICULTE_LABELS, LUMIERE_LABELS, ARROSAGE_LABELS } from '@/lib/data';
import { FilterBadge } from '@/components/ui/filter';

export function BouturesActiveFilters({
    activeDifficulte,
    activeLumiere,
    activeArrosage,
    activeChoixLibrairie,
    push,
    onReset,
}: {
    activeDifficulte?: string;
    activeLumiere?: string;
    activeArrosage?: string;
    activeChoixLibrairie?: boolean;
    push: (updates: Record<string, string | undefined>) => void;
    onReset: () => void;
}) {
    const hasFilters =
        activeDifficulte ||
        activeLumiere ||
        activeArrosage ||
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
            {activeDifficulte && (
                <FilterBadge
                    label={
                        DIFFICULTE_LABELS[activeDifficulte] ?? activeDifficulte
                    }
                    onRemove={() => push({ difficulte: undefined })}
                />
            )}
            {activeLumiere && (
                <FilterBadge
                    label={LUMIERE_LABELS[activeLumiere] ?? activeLumiere}
                    onRemove={() => push({ lumiere: undefined })}
                />
            )}
            {activeArrosage && (
                <FilterBadge
                    label={ARROSAGE_LABELS[activeArrosage] ?? activeArrosage}
                    onRemove={() => push({ arrosage: undefined })}
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
