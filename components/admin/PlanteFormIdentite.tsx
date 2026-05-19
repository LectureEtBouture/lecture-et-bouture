import type { InferSelectModel } from 'drizzle-orm';
import type { plantes } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Plante = InferSelectModel<typeof plantes>;

export function PlanteFormIdentite({ plante }: { plante?: Plante }) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Identité</legend>
            <div>
                <label className={labelClass}>Nom *</label>
                <input
                    name="nom"
                    defaultValue={plante?.nom}
                    required
                    className={inputClass}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Espèce</label>
                    <input
                        name="espece"
                        defaultValue={plante?.espece ?? ''}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Famille</label>
                    <input
                        name="famille"
                        defaultValue={plante?.famille ?? ''}
                        className={inputClass}
                    />
                </div>
            </div>
        </fieldset>
    );
}
