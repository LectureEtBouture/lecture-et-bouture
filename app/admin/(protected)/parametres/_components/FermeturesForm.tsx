'use client';

import { useState, useTransition, useRef } from 'react';
import type { FermetureExceptionnelle } from '@/lib/types/parametres';
import { sauvegarderFermetures } from '@/lib/actions/parametres';

const inputCls =
    'border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm focus:outline-none focus:border-primary';

export function FermeturesForm({ initial }: { initial: FermetureExceptionnelle[] }) {
    const [fermetures, setFermetures] = useState<FermetureExceptionnelle[]>(initial);
    const [pending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<number | null>(null);
    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function add() {
        const today = new Date().toISOString().slice(0, 10);
        setFermetures((f) => [...f, { debut: today, fin: today, message: '' }]);
        setDirty(true);
        setSaved(false);
    }

    function remove(index: number) {
        setFermetures((f) => f.filter((_, i) => i !== index));
        setPendingDelete(null);
        setDirty(true);
        setSaved(false);
    }

    function update(index: number, patch: Partial<FermetureExceptionnelle>) {
        setFermetures((f) =>
            f.map((item, i) => (i === index ? { ...item, ...patch } : item)),
        );
        setDirty(true);
        setSaved(false);
    }

    function save() {
        startTransition(async () => {
            await sauvegarderFermetures(fermetures);
            setDirty(false);
            setSaved(true);
            if (savedTimer.current) clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => setSaved(false), 2500);
        });
    }

    return (
        <div className="space-y-4">
            {fermetures.length === 0 && (
                <p className="text-sm text-muted italic">
                    Aucune fermeture exceptionnelle prévue.
                </p>
            )}
            {fermetures.map((fermeture, index) => (
                <div
                    key={index}
                    className={`border p-4 space-y-3 transition-colors duration-150 ${
                        pendingDelete === index
                            ? 'border-danger/40 bg-[oklch(98.5%_0.015_25)]'
                            : 'border-border'
                    }`}
                >
                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-[0.1em] text-muted">
                                Du
                            </label>
                            <input
                                type="date"
                                value={fermeture.debut}
                                onChange={(evt) =>
                                    update(index, { debut: evt.target.value })
                                }
                                className={`${inputCls} w-40`}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase tracking-[0.1em] text-muted">
                                Au
                            </label>
                            <input
                                type="date"
                                value={fermeture.fin}
                                onChange={(evt) =>
                                    update(index, { fin: evt.target.value })
                                }
                                className={`${inputCls} w-40`}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setPendingDelete(pendingDelete === index ? null : index)
                            }
                            className="text-muted hover:text-danger transition-colors text-xs mt-4 shrink-0 ml-auto"
                        >
                            Supprimer
                        </button>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase tracking-[0.1em] text-muted">
                            Message (optionnel)
                        </label>
                        <input
                            type="text"
                            value={fermeture.message ?? ''}
                            onChange={(evt) =>
                                update(index, { message: evt.target.value })
                            }
                            placeholder="Ex : Congés d'été"
                            className={`${inputCls} w-full`}
                        />
                    </div>
                    {pendingDelete === index && (
                        <div className="flex items-center gap-4 pt-2 border-t border-danger/20">
                            <span className="text-xs text-danger flex-1">
                                Confirmer la suppression ?
                            </span>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                className="text-xs font-medium text-danger hover:underline"
                            >
                                Oui, supprimer
                            </button>
                            <button
                                type="button"
                                onClick={() => setPendingDelete(null)}
                                className="text-xs text-muted hover:text-foreground transition-colors"
                            >
                                Annuler
                            </button>
                        </div>
                    )}
                </div>
            ))}

            <div className="flex items-center gap-4 pt-1">
                <button
                    type="button"
                    onClick={add}
                    className="text-sm text-primary hover:text-primary-light transition-colors"
                >
                    + Ajouter une fermeture
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
