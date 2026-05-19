import type { InferSelectModel } from 'drizzle-orm';
import type { plantes } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Plante = InferSelectModel<typeof plantes>;

export function PlanteFormCommerce({ plante }: { plante?: Plante }) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Commerce</legend>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Prix (€) *</label>
                    <input
                        name="prix"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={plante?.prix ?? ''}
                        required
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Stock</label>
                    <input
                        name="stock"
                        type="number"
                        min="0"
                        defaultValue={plante?.stock ?? 0}
                        className={inputClass}
                    />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    name="choixLibrairie"
                    id="choixLibrairie"
                    defaultChecked={plante?.choixLibrairie ?? false}
                    className="w-4 h-4 border-border accent-primary"
                />
                <label
                    htmlFor="choixLibrairie"
                    className="text-sm text-foreground cursor-pointer"
                >
                    Choix de la librairie
                </label>
            </div>
        </fieldset>
    );
}
