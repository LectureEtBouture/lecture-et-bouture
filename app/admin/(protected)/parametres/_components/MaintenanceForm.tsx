'use client';

import { useState, useTransition, useRef } from 'react';
import type { Maintenance } from '@/lib/types/parametres';
import { sauvegarderMaintenance } from '@/lib/actions/parametres';

export function MaintenanceForm({ initial }: { initial: Maintenance }) {
    const [maintenance, setMaintenance] = useState<Maintenance>(initial);
    const [pending, startTransition] = useTransition();
    const [saved, setSaved] = useState(false);
    const [dirty, setDirty] = useState(false);
    const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function update(patch: Partial<Maintenance>) {
        setMaintenance((m) => ({ ...m, ...patch }));
        setDirty(true);
        setSaved(false);
    }

    function save() {
        startTransition(async () => {
            await sauvegarderMaintenance(maintenance);
            setDirty(false);
            setSaved(true);
            if (savedTimer.current) clearTimeout(savedTimer.current);
            savedTimer.current = setTimeout(() => setSaved(false), 2500);
        });
    }

    return (
        <div className="space-y-5">
            <label
                className={`flex items-center gap-3 cursor-pointer select-none p-4 border transition-colors duration-150 ${
                    maintenance.active
                        ? 'border-danger/40 bg-[oklch(98.5%_0.015_25)]'
                        : 'border-border bg-surface'
                }`}
            >
                <input
                    type="checkbox"
                    checked={maintenance.active}
                    onChange={(evt) => update({ active: evt.target.checked })}
                    className="accent-primary w-4 h-4"
                />
                <div>
                    <p className="text-sm font-medium text-foreground">
                        Mode maintenance actif
                    </p>
                    {maintenance.active && (
                        <p className="text-xs text-danger mt-0.5">
                            Le site public est actuellement inaccessible.
                        </p>
                    )}
                </div>
            </label>

            <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                    Message affiché aux visiteurs
                </label>
                <textarea
                    value={maintenance.message}
                    onChange={(evt) => update({ message: evt.target.value })}
                    rows={3}
                    className="border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm focus:outline-none focus:border-primary w-full resize-none"
                />
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
