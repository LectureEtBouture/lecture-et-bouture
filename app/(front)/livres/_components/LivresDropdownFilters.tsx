import type { SortLivres } from '@/lib/queries/livres';
import { SelectField } from '@/components/ui/filter';

const SORTS: { value: SortLivres; label: string }[] = [
    { value: 'alpha', label: 'A → Z' },
    { value: 'date', label: 'Récents en premier' },
    { value: 'note', label: 'Mieux notés' },
    { value: 'prix-asc', label: 'Prix croissant' },
    { value: 'prix-desc', label: 'Prix décroissant' },
    { value: 'editeur', label: 'Éditeur' },
];

export function LivresDropdownFilters({
    series,
    editeurs,
    formats,
    activeSerie,
    activeEditeur,
    activeFormat,
    activeSort,
    push,
}: {
    series: string[];
    editeurs: string[];
    formats: string[];
    activeSerie?: string;
    activeEditeur?: string;
    activeFormat?: string;
    activeSort?: SortLivres;
    push: (updates: Record<string, string | undefined>) => void;
}) {
    return (
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
                        label: format.charAt(0).toUpperCase() + format.slice(1),
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
    );
}
