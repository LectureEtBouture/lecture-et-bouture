import type { InferSelectModel } from 'drizzle-orm';
import type { livres, genres, rayons } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Livre = InferSelectModel<typeof livres>;
type Genre = InferSelectModel<typeof genres>;
type Rayon = InferSelectModel<typeof rayons>;

export function LivreFormClassification({
    livre,
    genresList,
    rayonsList,
}: {
    livre?: Livre;
    genresList: Genre[];
    rayonsList: Rayon[];
}) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Classification</legend>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Rayon</label>
                    <select
                        name="rayonId"
                        defaultValue={livre?.rayonId ?? ''}
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
                    <label className={labelClass}>Genre</label>
                    <select
                        name="genreId"
                        defaultValue={livre?.genreId ?? ''}
                        className={inputClass}
                    >
                        <option value="">— Aucun —</option>
                        {genresList.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.nom}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </fieldset>
    );
}
