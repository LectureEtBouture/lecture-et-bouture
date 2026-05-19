'use client';

import { useState, useTransition, useRef } from 'react';
import type { ReseauxSociaux, ReseauSocial, PlatformSocial } from '@/lib/types/parametres';
import { sauvegarderReseaux } from '@/lib/actions/parametres';

const PLATFORMS: PlatformSocial[] = [
    'instagram',
    'facebook',
    'tiktok',
    'x',
    'linkedin',
    'youtube',
    'pinterest',
];

const inputCls =
    'border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm focus:outline-none focus:border-primary';

export function ReseauxForm({ initial }: { initial: ReseauxSociaux }) {
    const [reseaux, setReseaux] = useState<ReseauxSociaux>(initial);
    const [pending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<number | null>(null);
    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function add() {
        setReseaux((r) => [...r, { platform: 'instagram', url: '' }]);
        setDirty(true);
        setSaved(false);
    }

    function remove(index: number) {
        setReseaux((r) => r.filter((_, i) => i !== index));
        setPendingDelete(null);
        setDirty(true);
        setSaved(false);
    }

    function update(index: number, patch: Partial<ReseauSocial>) {
        setReseaux((r) =>
            r.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        );
        setDirty(true);
        setSaved(false);
    }

    function save() {
        startTransition(async () => {
            await sauvegarderReseaux(reseaux);
            setDirty(false);
            setSaved(true);
            if (savedTimer.current) clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => setSaved(false), 2500);
        });
    }

    return (
        <div className="space-y-3">
            {reseaux.length === 0 && (
                <p className="text-sm text-muted italic">
                    Aucun réseau configuré.
                </p>
            )}
            {reseaux.map((reseau, index) =>
                pendingDelete === index ? (
                    <div
                        key={index}
                        className="flex items-center gap-3 px-4 py-3 bg-[oklch(98.5%_0.015_25)] border border-danger/30 transition-colors duration-150"
                    >
                        <span className="flex-1 text-xs text-foreground/60 truncate">
                            {reseau.platform}
                            {reseau.url ? ` · ${reseau.url}` : ''}
                        </span>
                        <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-xs font-medium text-danger hover:underline shrink-0"
                        >
                            Oui, supprimer
                        </button>
                        <button
                            type="button"
                            onClick={() => setPendingDelete(null)}
                            className="text-xs text-muted hover:text-foreground transition-colors shrink-0"
                        >
                            Annuler
                        </button>
                    </div>
                ) : (
                    <div key={index} className="flex items-center gap-3">
                        <select
                            value={reseau.platform}
                            onChange={(evt) =>
                                update(index, {
                                    platform: evt.target.value as PlatformSocial,
                                })
                            }
                            className={`${inputCls} w-36 shrink-0`}
                        >
                            {PLATFORMS.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        <input
                            type="url"
                            value={reseau.url}
                            onChange={(evt) =>
                                update(index, { url: evt.target.value })
                            }
                            placeholder="https://…"
                            className={`${inputCls} flex-1`}
                        />
                        <button
                            type="button"
                            onClick={() => setPendingDelete(index)}
                            className="text-muted hover:text-danger transition-colors text-xs px-2 py-2 shrink-0"
                        >
                            Supprimer
                        </button>
                    </div>
                ),
            )}

            <div className="flex items-center gap-4 pt-1">
                <button
                    type="button"
                    onClick={add}
                    className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                    + Ajouter un réseau
                </button>
                <div className="flex items-center gap-3 ml-auto">
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
        </div>
    );
}
