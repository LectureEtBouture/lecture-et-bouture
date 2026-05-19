import type { InferSelectModel } from 'drizzle-orm';
import type { livres } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Livre = InferSelectModel<typeof livres>;

export function LivreFormContenu({ livre }: { livre?: Livre }) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Contenu</legend>
            <div>
                <label className={labelClass}>Description *</label>
                <textarea
                    name="description"
                    defaultValue={livre?.description ?? ''}
                    rows={5}
                    className={`${inputClass} resize-none`}
                />
            </div>
            <div>
                <label className={labelClass}>Image (URL)</label>
                <input
                    name="image"
                    defaultValue={livre?.image ?? ''}
                    className={inputClass}
                    placeholder="/covers/nom-du-livre.jpg"
                />
            </div>
        </fieldset>
    );
}
