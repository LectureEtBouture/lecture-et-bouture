'use client';

import { useState } from 'react';
import { RteField } from './RteField';

export function RtePageForm({
    action,
    defaultValue,
    backHref,
}: {
    action: (formData: FormData) => Promise<void>;
    defaultValue: string;
    backHref: string;
}) {
    const [isDirty, setIsDirty] = useState(false);

    return (
        <form action={action} className="space-y-6">
            <RteField
                name="contenu"
                defaultValue={defaultValue}
                onDirtyChange={setIsDirty}
            />
            <div className="flex gap-3">
                <button
                    type="submit"
                    disabled={!isDirty}
                    className={`px-6 py-2 text-[11px] uppercase tracking-[0.1em] transition-colors ${
                        isDirty
                            ? 'bg-primary text-background hover:bg-primary-light'
                            : 'bg-surface text-muted border border-border cursor-not-allowed'
                    }`}
                >
                    Enregistrer
                </button>
                <a
                    href={backHref}
                    className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                >
                    Annuler
                </a>
            </div>
        </form>
    );
}
