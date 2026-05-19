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
    selectedGenreIds,
    genresList,
    rayonId,
    rayonsList,
}: {
    selectedGenreIds: number[];
    genresList: Genre[];
    rayonId?: number | null;
    rayonsList: Rayon[];
}) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Classification</legend>
            <div>
                <label className={labelClass}>Rayon</label>
                <select
                    name="rayonId"
                    defaultValue={rayonId ?? ''}
                    className={inputClass}
                >
                    <option value="">— Aucun —</option>
                    {rayonsList.map((rayon) => (
                        <option key={rayon.id} value={rayon.id}>
                            {rayon.nom}
                        </option>
                    ))}
                </select>
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
                                defaultChecked={selectedGenreIds.includes(
                                    genre.id,
                                )}
                                className="accent-primary"
                            />
                            <span className="text-[12px] text-foreground">
                                {genre.nom}
                            </span>
                        </label>
                    ))}
                </div>
            </div>
        </fieldset>
    );
}
