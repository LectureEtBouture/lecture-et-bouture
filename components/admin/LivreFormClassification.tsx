'use client';

import type { InferSelectModel } from 'drizzle-orm';
import type { genres, rayons } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Genre = InferSelectModel<typeof genres>;
type Rayon = InferSelectModel<typeof rayons>;

export function LivreFormClassification({
    checkedGenreIds,
    onGenreChange,
    genresList,
    rayonIdValue,
    onRayonChange,
    rayonsList,
    suggestedCategories = [],
    suggestedRayonLabel,
}: {
    checkedGenreIds: string[];
    onGenreChange: (id: string, checked: boolean) => void;
    genresList: Genre[];
    rayonIdValue: string;
    onRayonChange: (id: string) => void;
    rayonsList: Rayon[];
    suggestedCategories?: string[];
    suggestedRayonLabel?: string;
}) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Classification</legend>
            <div>
                <label className={labelClass}>Rayon</label>
                <select
                    name="rayonId"
                    value={rayonIdValue}
                    onChange={(e) => onRayonChange(e.target.value)}
                    className={inputClass}
                >
                    <option value="">— Aucun —</option>
                    {rayonsList.map((rayon) => (
                        <option key={rayon.id} value={rayon.id}>
                            {rayon.nom}
                        </option>
                    ))}
                </select>
                {suggestedRayonLabel && !rayonIdValue && (
                    <p className="mt-1 text-[11px] text-muted">
                        Suggestion Google Books : {suggestedRayonLabel}
                        {rayonsList.every((r) => r.nom !== suggestedRayonLabel) && (
                            <span className="text-amber-600"> (rayon à créer)</span>
                        )}
                    </p>
                )}
            </div>
            <div>
                <p className={labelClass}>Genres</p>
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
                    {genresList.map((genre) => (
                        <label
                            key={genre.id}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                name="genreIds"
                                value={genre.id}
                                checked={checkedGenreIds.includes(genre.id)}
                                onChange={(e) => onGenreChange(genre.id, e.target.checked)}
                                className="accent-primary"
                            />
                            <span className="text-[12px] text-foreground">
                                {genre.nom}
                            </span>
                        </label>
                    ))}
                </div>
                {suggestedCategories.length > 0 && (
                    <p className="mt-2 text-[11px] text-muted">
                        Google Books : {suggestedCategories.join(' · ')}
                    </p>
                )}
            </div>
        </fieldset>
    );
}
