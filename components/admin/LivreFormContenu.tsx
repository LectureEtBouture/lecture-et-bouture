import type { InferSelectModel } from 'drizzle-orm';
import type { livres } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';
import { ImageUpload } from './ImageUpload';

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
            <ImageUpload
                defaultValue={livre?.image}
                defaultAltValue={livre?.imageAlt}
                folder="boutures"
            />
        </fieldset>
    );
}
