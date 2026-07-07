'use client';

import { useEffect, useRef, useState } from 'react';
import { listStorageAssets } from '@/lib/actions/storage';
import type { StorageItem } from '@/lib/queries/storage';

const FOLDER_LABELS: Record<string, string> = {
    livres: 'Livres',
    boutures: 'Boutures',
    evenements: 'Événements',
    blog: 'Blog',
};

type FolderFilter = 'tous' | keyof typeof FOLDER_LABELS;
type SortOrder = 'date-desc' | 'date-asc';

function formatKo(bytes: number) {
    return `${Math.round(bytes / 1000)} Ko`;
}

export function AssetPickerModal({
    open,
    defaultFolder,
    onSelect,
    onClose,
}: {
    open: boolean;
    defaultFolder: 'livres' | 'boutures' | 'evenements' | 'blog';
    onSelect: (url: string) => void;
    onClose: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [items, setItems] = useState<StorageItem[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortOrder>('date-desc');
    const [folder, setFolder] = useState<FolderFilter>(defaultFolder);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        if (!open || items !== null) return;
        listStorageAssets()
            .then(setItems)
            .catch(() => setError('Impossible de charger la bibliothèque.'));
    }, [open, items]);

    const filtered = (items ?? [])
        .filter((item) => folder === 'tous' || item.folder === folder)
        .filter((item) => item.key.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) =>
            sort === 'date-desc'
                ? b.lastModified.getTime() - a.lastModified.getTime()
                : a.lastModified.getTime() - b.lastModified.getTime(),
        );

    return (
        <dialog
            ref={dialogRef}
            onCancel={onClose}
            className="backdrop:bg-foreground/20 border border-border bg-surface p-6 max-w-3xl w-full max-h-[85vh]"
        >
            <div className="flex items-center justify-between mb-4">
                <p className="font-serif text-base font-bold text-foreground">
                    Bibliothèque d&apos;assets
                </p>
                <button
                    type="button"
                    onClick={onClose}
                    className="text-muted hover:text-foreground transition-colors text-sm"
                    aria-label="Fermer"
                >
                    ×
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(evt) => setSearch(evt.target.value)}
                    placeholder="Rechercher par nom…"
                    className="border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1 min-w-[160px]"
                />
                <select
                    value={folder}
                    onChange={(evt) =>
                        setFolder(evt.target.value as FolderFilter)
                    }
                    className="border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                    <option value="tous">Tous</option>
                    <option value="livres">Livres</option>
                    <option value="boutures">Boutures</option>
                    <option value="evenements">Événements</option>
                    <option value="blog">Blog</option>
                </select>
                <select
                    value={sort}
                    onChange={(evt) => setSort(evt.target.value as SortOrder)}
                    className="border border-border bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                    <option value="date-desc">Plus récent</option>
                    <option value="date-asc">Plus ancien</option>
                </select>
            </div>

            <div className="overflow-y-auto max-h-[55vh]">
                {error && <p className="text-sm text-danger">{error}</p>}
                {!error && items === null && (
                    <p className="text-sm text-muted py-8 text-center">
                        Chargement…
                    </p>
                )}
                {!error && items !== null && filtered.length === 0 && (
                    <p className="text-sm text-muted py-8 text-center">
                        Aucun fichier pour cette recherche.
                    </p>
                )}
                {!error && items !== null && filtered.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => onSelect(item.url)}
                                className="border border-border p-2 space-y-1.5 text-left hover:border-primary transition-colors"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.url}
                                    alt=""
                                    className="w-full aspect-square object-cover bg-background"
                                />
                                <p
                                    className="text-[10px] text-muted font-mono truncate"
                                    title={item.key}
                                >
                                    {item.key}
                                </p>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-muted tabular-nums">
                                        {formatKo(item.sizeBytes)}
                                    </span>
                                    {item.heavy && (
                                        <span className="uppercase tracking-[0.08em] px-1.5 py-0.5 border border-danger text-danger leading-none">
                                            Lourd
                                        </span>
                                    )}
                                    {item.usedBy && (
                                        <span className="text-primary truncate max-w-[60%]">
                                            {FOLDER_LABELS[item.folder] ??
                                                item.folder}{' '}
                                            · {item.usedBy.label}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </dialog>
    );
}
