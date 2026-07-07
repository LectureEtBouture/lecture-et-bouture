'use client';

import { useState } from 'react';
import { inputClass } from '@/components/admin/formStyles';

export type LivreEnrichi = {
    inventaireUri: string;
    titre: string | null;
    image: string | null;
    choixLibrairie: boolean;
};

export function SelectionLivrePicker({
    livres,
    onPick,
}: {
    livres: LivreEnrichi[];
    onPick: (livre: LivreEnrichi) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [choixOnly, setChoixOnly] = useState(false);

    const filtered = livres
        .filter((livre) => !choixOnly || livre.choixLibrairie)
        .filter((livre) =>
            (livre.titre ?? '').toLowerCase().includes(search.toLowerCase()),
        );

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-[11px] uppercase tracking-[0.08em] text-primary hover:underline"
            >
                Parcourir les livres enrichis ({livres.length})
            </button>
        );
    }

    return (
        <div className="border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground">
                    Livres enrichis
                </p>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-[11px] text-muted hover:text-foreground"
                >
                    Fermer
                </button>
            </div>
            <div className="flex items-center gap-3">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher par titre…"
                    className={`${inputClass} flex-1`}
                />
                <label className="flex items-center gap-1.5 text-[11px] text-muted whitespace-nowrap cursor-pointer">
                    <input
                        type="checkbox"
                        checked={choixOnly}
                        onChange={(e) => setChoixOnly(e.target.checked)}
                        className="w-3 h-3"
                    />
                    Choix librairie
                </label>
            </div>
            <ul className="max-h-64 overflow-y-auto divide-y divide-border/50">
                {filtered.length === 0 ? (
                    <li className="text-[11px] text-muted py-3 text-center">
                        Aucun résultat.
                    </li>
                ) : (
                    filtered.map((livre) => (
                        <li key={livre.inventaireUri}>
                            <button
                                type="button"
                                onClick={() => onPick(livre)}
                                className="w-full text-left px-2 py-2 text-sm hover:bg-surface transition-colors flex items-center gap-2"
                            >
                                {livre.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={livre.image}
                                        alt=""
                                        className="w-6 h-8 object-cover shrink-0 rounded-sm"
                                    />
                                )}
                                <span className="min-w-0 truncate">
                                    {livre.titre ?? livre.inventaireUri}
                                </span>
                                {livre.choixLibrairie && (
                                    <span className="text-[9px] uppercase tracking-widest text-primary shrink-0 ml-auto">
                                        Choix
                                    </span>
                                )}
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
