import type { InferSelectModel } from 'drizzle-orm';
import type { plantes } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Plante = InferSelectModel<typeof plantes>;

export function PlanteFormEntretien({ plante }: { plante?: Plante }) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Entretien</legend>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className={labelClass}>Difficulté</label>
                    <select
                        name="difficulte"
                        defaultValue={plante?.difficulte ?? ''}
                        className={inputClass}
                    >
                        <option value="">—</option>
                        <option value="facile">Facile</option>
                        <option value="moyen">Moyen</option>
                        <option value="difficile">Difficile</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Lumière</label>
                    <select
                        name="lumiere"
                        defaultValue={plante?.lumiere ?? ''}
                        className={inputClass}
                    >
                        <option value="">—</option>
                        <option value="ombre">Ombre</option>
                        <option value="mi-ombre">Mi-ombre</option>
                        <option value="lumiere-vive">Lumière vive</option>
                        <option value="plein-soleil">Plein soleil</option>
                    </select>
                </div>
                <div>
                    <label className={labelClass}>Arrosage</label>
                    <select
                        name="arrosage"
                        defaultValue={plante?.arrosage ?? ''}
                        className={inputClass}
                    >
                        <option value="">—</option>
                        <option value="rare">Rare</option>
                        <option value="modere">Modéré</option>
                        <option value="regulier">Régulier</option>
                        <option value="abondant">Abondant</option>
                    </select>
                </div>
            </div>
            <div>
                <label className={labelClass}>Conseils d&apos;entretien</label>
                <textarea
                    name="conseilsEntretien"
                    defaultValue={plante?.conseilsEntretien ?? ''}
                    rows={4}
                    className={`${inputClass} resize-none`}
                />
            </div>
        </fieldset>
    );
}
