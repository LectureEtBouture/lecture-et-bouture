'use client';

import type { InferSelectModel } from 'drizzle-orm';
import type { livres } from '@/db/schema';
import { inputClass, labelClass, fieldsetClass, legendClass } from './formStyles';
import { ISBNImportRow } from './ISBNImportRow';
import type { LivreMetadata } from '@/lib/services/books/types';

type Livre = InferSelectModel<typeof livres>;

interface Props {
    livre?: Livre;
    onImport?: (data: LivreMetadata) => void;
    inventaireUri?: string;
    onInventaireUriChange?: (val: string) => void;
}

export function LivreFormIdentite({ livre, onImport, inventaireUri, onInventaireUriChange }: Props) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Identité</legend>

            <div>
                <label className={labelClass}>URI inventaire *</label>
                <input
                    name="inventaireUri"
                    value={livre ? livre.inventaireUri : (inventaireUri ?? '')}
                    onChange={(e) => onInventaireUriChange?.(e.target.value)}
                    required={!livre}
                    placeholder="isbn:9782070368228 ou wd:Q12345"
                    className={inputClass}
                    readOnly={!!livre}
                />
                {livre && (
                    <p className="text-[11px] text-muted mt-1">
                        L&apos;URI inventaire ne peut pas être modifiée après création.
                    </p>
                )}
            </div>

            {!livre && (
                <ISBNImportRow
                    key={inventaireUri?.startsWith('isbn:') ? inventaireUri.slice(5) : ''}
                    defaultValue=""
                    isbnExterne={inventaireUri?.startsWith('isbn:') ? inventaireUri.slice(5) : ''}
                    onImport={onImport ?? (() => {})}
                />
            )}

            <div>
                <label className={labelClass}>N° dans la série</label>
                <input
                    name="numeroSerie"
                    type="number"
                    min="1"
                    defaultValue={livre?.numeroSerie ?? ''}
                    className={inputClass}
                />
            </div>
        </fieldset>
    );
}
