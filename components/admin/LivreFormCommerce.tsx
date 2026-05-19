import type { InferSelectModel } from 'drizzle-orm';
import type { livres } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Livre = InferSelectModel<typeof livres>;

export function LivreFormCommerce({ livre }: { livre?: Livre }) {
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
                        defaultValue={livre?.prix ?? ''}
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
                        defaultValue={livre?.stock ?? 0}
                        className={inputClass}
                    />
                </div>
            </div>
        </fieldset>
    );
}
