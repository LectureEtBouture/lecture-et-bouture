'use client';

import type { InferSelectModel } from 'drizzle-orm';
import type { livres } from '@/db/schema';
import { inputClass, labelClass, fieldsetClass } from './formStyles';

type Livre = InferSelectModel<typeof livres>;

export function LivreFormLibrairie({ livre }: { livre?: Livre }) {
    return (
        <details
            className={fieldsetClass}
            open={!!(livre?.choixLibrairie || livre?.noteDeLaLibrairie)}
        >
            <summary className="list-none cursor-pointer flex items-center gap-2 select-none text-xs font-medium text-foreground uppercase tracking-widest [&::-webkit-details-marker]:hidden">
                <span className="text-[8px] text-muted [[open]_&]:rotate-90 transition-transform duration-150">▶</span>
                Sélection librairie
                <span className="text-[10px] text-muted font-normal normal-case tracking-normal">
                    (optionnel)
                </span>
            </summary>

            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        name="choixLibrairie"
                        id="choixLibrairie"
                        defaultChecked={livre?.choixLibrairie ?? false}
                        className="w-4 h-4 border-border accent-primary"
                    />
                    <label
                        htmlFor="choixLibrairie"
                        className="text-sm text-foreground cursor-pointer"
                    >
                        Choix de la librairie
                    </label>
                </div>

                <div>
                    <label className={labelClass}>Note de la librairie</label>
                    <textarea
                        name="noteDeLaLibrairie"
                        defaultValue={livre?.noteDeLaLibrairie ?? ''}
                        rows={4}
                        className={`${inputClass} resize-none`}
                        placeholder="Pourquoi on aime ce livre…"
                    />
                </div>
            </div>
        </details>
    );
}
