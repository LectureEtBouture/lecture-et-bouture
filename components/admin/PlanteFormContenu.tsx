'use client';

import type { InferSelectModel } from 'drizzle-orm';
import type { plantes } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';
import { ImageUpload } from './ImageUpload';
import { RteField } from './RteField';

type Plante = InferSelectModel<typeof plantes>;

export function PlanteFormContenu({ plante }: { plante?: Plante }) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Contenu</legend>
            <div>
                <label className={labelClass}>Description</label>
                <RteField
                    name="description"
                    defaultValue={plante?.description ?? ''}
                />
            </div>
            <div>
                <label className={labelClass}>Conseils d&apos;entretien</label>
                <RteField
                    name="conseilsEntretien"
                    defaultValue={plante?.conseilsEntretien ?? ''}
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
            <ImageUpload
                defaultValue={plante?.image}
                defaultAltValue={plante?.imageAlt}
                folder="boutures"
            />
        </fieldset>
    );
}
