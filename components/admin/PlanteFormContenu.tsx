import type { InferSelectModel } from 'drizzle-orm';
import type { plantes } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Plante = InferSelectModel<typeof plantes>;

export function PlanteFormContenu({ plante }: { plante?: Plante }) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Contenu</legend>
            <div>
                <label className={labelClass}>Description</label>
                <textarea
                    name="description"
                    defaultValue={plante?.description ?? ''}
                    rows={5}
                    className={`${inputClass} resize-none`}
                />
            </div>
            <div>
                <label className={labelClass}>Note de la librairie</label>
                <textarea
                    name="noteDeLaLibrairie"
                    defaultValue={plante?.noteDeLaLibrairie ?? ''}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="Pourquoi on aime cette bouture…"
                />
            </div>
            <div>
                <label className={labelClass}>Image (URL)</label>
                <input
                    name="image"
                    defaultValue={plante?.image ?? ''}
                    className={inputClass}
                    placeholder="/covers/nom-de-la-bouture.jpg"
                />
            </div>
        </fieldset>
    );
}
