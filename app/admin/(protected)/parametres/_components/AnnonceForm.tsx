'use client';

import { useState, useTransition, useRef } from 'react';
import type { Annonce } from '@/lib/types/parametres';
import { sauvegarderAnnonce } from '@/lib/actions/parametres';

const inputCls =
    'border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm focus:outline-none focus:border-primary w-full';

export function AnnonceForm({ initial }: { initial: Annonce }) {
    const [annonce, setAnnonce] = useState<Annonce>(initial);
    const [pending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);
    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function update(patch: Partial<Annonce>) {
        setAnnonce((a) => ({ ...a, ...patch }));
        setDirty(true);
        setSaved(false);
    }

    function save() {
        startTransition(async () => {
            await sauvegarderAnnonce(annonce);
            setDirty(false);
            setSaved(true);
            if (savedTimer.current) clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => setSaved(false), 2500);
        });
    }

    return (
        <div className="space-y-5">
            <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={annonce.active}
                    onChange={(evt) => update({ active: evt.target.checked })}
                    className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-medium text-foreground">
                    Annonce active
                </span>
            </label>

            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                    Type
                </label>
                <select
                    value={annonce.type}
                    onChange={(evt) =>
                        update({ type: evt.target.value as Annonce['type'] })
                    }
                    className="border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm focus:outline-none focus:border-primary w-40"
                >
                    <option value="info">Info</option>
                    <option value="warning">Avertissement</option>
                </select>
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                    Message
                </label>
                <textarea
                    value={annonce.message}
                    onChange={(evt) => update({ message: evt.target.value })}
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Texte affiché dans le bandeau…"
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                    Expiration (optionnel)
                </label>
                <input
                    type="datetime-local"
                    value={
                        annonce.expire_at ? annonce.expire_at.slice(0, 16) : ''
                    }
                    onChange={(evt) =>
                        update({
                            expire_at: evt.target.value
                                ? new Date(evt.target.value).toISOString()
                                : null,
                        })
                    }
                    className="border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm focus:outline-none focus:border-primary w-56"
                />
                {annonce.expire_at && (
                    <button
                        type="button"
                        onClick={() => update({ expire_at: null })}
                        className="text-xs text-muted hover:text-foreground self-start transition-colors"
                    >
                        Supprimer l&apos;expiration
                    </button>
                )}
            </div>

            <div className="flex items-center gap-3">
                {dirty && !pending && !saved && (
                    <span className="text-[11px] text-[oklch(0.62_0.10_60)]">
                        · non enregistré
                    </span>
                )}
                <button
                    type="button"
                    onClick={save}
                    disabled={pending || saved}
                    className="bg-primary text-background px-6 py-2.5 text-[11px] uppercase tracking-[0.1em] font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                    {pending
                        ? 'Enregistrement…'
                        : saved
                          ? 'Enregistré ✓'
                          : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
}
