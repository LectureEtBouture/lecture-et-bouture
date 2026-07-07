'use client';

import { useState, useTransition, useRef } from 'react';
import type {
    Horaires,
    JourSemaine,
    PlageHoraire,
} from '@/lib/types/parametres';
import { sauvegarderHoraires } from '@/lib/actions/parametres';

const JOURS: { key: JourSemaine; label: string }[] = [
    { key: 'lun', label: 'Lundi' },
    { key: 'mar', label: 'Mardi' },
    { key: 'mer', label: 'Mercredi' },
    { key: 'jeu', label: 'Jeudi' },
    { key: 'ven', label: 'Vendredi' },
    { key: 'sam', label: 'Samedi' },
    { key: 'dim', label: 'Dimanche' },
];

const inputCls =
    'border border-border bg-surface text-foreground px-2 py-1 text-sm focus:outline-none focus:border-primary w-[90px]';

export function HorairesForm({ initial }: { initial: Horaires }) {
    const [horaires, setHoraires] = useState<Horaires>(initial);
    const [pending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);
    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function setJour(jour: JourSemaine, val: PlageHoraire | null) {
        setHoraires((h) => ({ ...h, [jour]: val }));
        setDirty(true);
        setSaved(false);
    }

    function save() {
        startTransition(async () => {
            await sauvegarderHoraires(horaires);
            setDirty(false);
            setSaved(true);
            if (savedTimer.current) clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => setSaved(false), 2500);
        });
    }

    return (
        <div className="space-y-3">
            {JOURS.map(({ key, label }) => {
                const ouvert = horaires[key] !== null;
                const plage = horaires[key];
                return (
                    <div
                        key={key}
                        className="flex items-center gap-3 flex-wrap"
                    >
                        <span className="w-24 text-sm text-foreground shrink-0">
                            {label}
                        </span>
                        <label className="flex items-center gap-2 text-sm text-muted cursor-pointer select-none w-20 shrink-0">
                            <input
                                type="checkbox"
                                checked={ouvert}
                                onChange={(evt) =>
                                    setJour(
                                        key,
                                        evt.target.checked
                                            ? { open: '10:00', close: '19:00' }
                                            : null,
                                    )
                                }
                                className="accent-primary"
                            />
                            Ouvert
                        </label>
                        {ouvert && plage && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <input
                                    type="time"
                                    value={plage.open}
                                    aria-label={`${label} — heure d'ouverture`}
                                    onChange={(evt) =>
                                        setJour(key, {
                                            ...plage,
                                            open: evt.target.value,
                                        })
                                    }
                                    className={inputCls}
                                />
                                <span
                                    className="text-muted text-sm"
                                    aria-hidden="true"
                                >
                                    –
                                </span>
                                <input
                                    type="time"
                                    value={plage.close}
                                    aria-label={`${label} — heure de fermeture`}
                                    onChange={(evt) =>
                                        setJour(key, {
                                            ...plage,
                                            close: evt.target.value,
                                        })
                                    }
                                    className={inputCls}
                                />
                                <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none ml-2">
                                    <input
                                        type="checkbox"
                                        checked={!!plage.pause}
                                        onChange={(evt) =>
                                            setJour(key, {
                                                ...plage,
                                                pause: evt.target.checked
                                                    ? {
                                                          debut: '12:00',
                                                          fin: '13:00',
                                                      }
                                                    : null,
                                            })
                                        }
                                        className="accent-primary"
                                    />
                                    Pause
                                </label>
                                {plage.pause && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="time"
                                            value={plage.pause.debut}
                                            aria-label={`${label} — début de pause`}
                                            onChange={(evt) =>
                                                setJour(key, {
                                                    ...plage,
                                                    pause: {
                                                        ...plage.pause!,
                                                        debut: evt.target.value,
                                                    },
                                                })
                                            }
                                            className={inputCls}
                                        />
                                        <span
                                            className="text-muted text-sm"
                                            aria-hidden="true"
                                        >
                                            –
                                        </span>
                                        <input
                                            type="time"
                                            value={plage.pause.fin}
                                            aria-label={`${label} — fin de pause`}
                                            onChange={(evt) =>
                                                setJour(key, {
                                                    ...plage,
                                                    pause: {
                                                        ...plage.pause!,
                                                        fin: evt.target.value,
                                                    },
                                                })
                                            }
                                            className={inputCls}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
            <div className="flex items-center gap-3 pt-2">
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
