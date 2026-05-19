import { LUMIERE_LABELS, ARROSAGE_LABELS } from '@/lib/data';
import type { SortBoutures } from '@/lib/queries/boutures';
import { SelectField } from '@/components/ui/filter';

const SORTS: { value: SortBoutures; label: string }[] = [
    { value: 'alpha', label: 'A → Z' },
    { value: 'note', label: 'Mieux notées' },
    { value: 'prix-asc', label: 'Prix croissant' },
    { value: 'prix-desc', label: 'Prix décroissant' },
    { value: 'difficulte', label: 'Difficulté' },
];

const LUMIERES = Object.entries(LUMIERE_LABELS);
const ARROSAGES = Object.entries(ARROSAGE_LABELS);

export function BouturesDropdownFilters({
    activeLumiere,
    activeArrosage,
    activeSort,
    push,
}: {
    activeLumiere?: string;
    activeArrosage?: string;
    activeSort?: SortBoutures;
    push: (updates: Record<string, string | undefined>) => void;
}) {
    return (
        <div className="flex flex-wrap gap-3 items-end">
            <SelectField
                label="Lumière"
                value={activeLumiere ?? ''}
                onChange={(val) => push({ lumiere: val || undefined })}
                options={LUMIERES.map(([value, label]) => ({ value, label }))}
                placeholder="Toutes"
            />
            <SelectField
                label="Arrosage"
                value={activeArrosage ?? ''}
                onChange={(val) => push({ arrosage: val || undefined })}
                options={ARROSAGES.map(([value, label]) => ({ value, label }))}
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
    );
}
