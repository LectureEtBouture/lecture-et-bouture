'use client';

import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

interface Props {
    prixValue: string;
    onPrixChange: (v: string) => void;
}

export function LivreFormCommerce({ prixValue, onPrixChange }: Props) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Commerce</legend>
            <div>
                <label className={labelClass}>Prix indicatif (€)</label>
                <input
                    name="prix"
                    type="number"
                    step="0.01"
                    min="0"
                    value={prixValue}
                    onChange={(e) => onPrixChange(e.target.value)}
                    className={inputClass}
                />
                <p className="text-[11px] text-muted mt-1">
                    Prix physique indicatif — à renseigner manuellement.
                </p>
            </div>
        </fieldset>
    );
}
