'use client';

import { useState, useTransition } from 'react';
import { ConfirmDialog } from '@/app/admin/(protected)/_components/ConfirmDialog';
import { useToast } from '@/app/admin/(protected)/_components/ToastProvider';
import {
    deleteStorageObject,
    deleteStorageObjects,
} from '@/lib/actions/storage';
import type { StorageItem } from '@/lib/queries/storage';

const FOLDER_LABELS: Record<string, string> = {
    livres: 'Livres',
    boutures: 'Boutures',
    evenements: 'Événements',
    blog: 'Blog',
};

type FolderFilter = 'tous' | 'non-utilises' | keyof typeof FOLDER_LABELS;

function formatKo(bytes: number) {
    return `${Math.round(bytes / 1000)} Ko`;
}

export function StockageBrowser({
    items: initialItems,
}: {
    items: StorageItem[];
}) {
    const [items, setItems] = useState(initialItems);
    const [folder, setFolder] = useState<FolderFilter>('tous');
    const [heavyOnly, setHeavyOnly] = useState(false);
    const [pending, startTransition] = useTransition();
    const [toDelete, setToDelete] = useState<StorageItem | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [bulkConfirm, setBulkConfirm] = useState(false);
    const showToast = useToast();

    const filtered = items.filter((item) => {
        if (heavyOnly && !item.heavy) return false;
        if (folder === 'tous') return true;
        if (folder === 'non-utilises') return item.usedBy === null;
        return item.folder === folder;
    });

    function toggleSelected(key: string) {
        setSelected((current) => {
            const next = new Set(current);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    function confirmDelete() {
        if (!toDelete) return;
        const key = toDelete.key;
        setToDelete(null);
        startTransition(async () => {
            const result = await deleteStorageObject(key);
            if (result.ok) {
                setItems((current) =>
                    current.filter((item) => item.key !== key),
                );
                showToast('Fichier supprimé.', 'success');
            } else {
                showToast(result.error, 'error');
            }
        });
    }

    function confirmBulkDelete() {
        const keys = Array.from(selected);
        setBulkConfirm(false);
        startTransition(async () => {
            const result = await deleteStorageObjects(keys);
            if (result.deleted.length > 0) {
                setItems((current) =>
                    current.filter(
                        (item) => !result.deleted.includes(item.key),
                    ),
                );
            }
            setSelected(new Set());
            if (result.failed.length === 0) {
                showToast(
                    `${result.deleted.length} fichier${result.deleted.length !== 1 ? 's' : ''} supprimé${result.deleted.length !== 1 ? 's' : ''}.`,
                    'success',
                );
            } else {
                showToast(
                    `${result.deleted.length} supprimé(s), ${result.failed.length} échec(s) — fichier(s) utilisé(s).`,
                    'error',
                );
            }
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <select
                    value={folder}
                    onChange={(evt) =>
                        setFolder(evt.target.value as FolderFilter)
                    }
                    className="border border-border bg-surface text-foreground px-3 py-2 text-sm focus:outline-none focus:border-primary"
                >
                    <option value="tous">Tous</option>
                    <option value="livres">Livres</option>
                    <option value="boutures">Boutures</option>
                    <option value="evenements">Événements</option>
                    <option value="blog">Blog</option>
                    <option value="non-utilises">Non utilisés</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={heavyOnly}
                        onChange={(evt) => setHeavyOnly(evt.target.checked)}
                        className="accent-primary w-4 h-4"
                    />
                    Fichiers lourds uniquement
                </label>
            </div>

            {selected.size > 0 && (
                <div className="flex items-center justify-between bg-surface border border-border px-4 py-2.5">
                    <span className="text-sm text-foreground">
                        {selected.size} sélectionné
                        {selected.size !== 1 ? 's' : ''}
                    </span>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => setSelected(new Set())}
                            className="text-[11px] text-muted hover:text-foreground transition-colors"
                        >
                            Désélectionner
                        </button>
                        <button
                            type="button"
                            disabled={pending}
                            onClick={() => setBulkConfirm(true)}
                            className="text-[11px] uppercase tracking-[0.1em] font-medium text-danger hover:underline disabled:opacity-50"
                        >
                            Supprimer la sélection
                        </button>
                    </div>
                </div>
            )}

            {filtered.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucun fichier pour ce filtre.
                </p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map((item) => (
                        <div
                            key={item.key}
                            className="border border-border p-3 space-y-2"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={item.url}
                                alt=""
                                className="w-full aspect-square object-cover bg-background"
                            />
                            <p
                                className="text-[11px] text-muted font-mono truncate"
                                title={item.key}
                            >
                                {item.key}
                            </p>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="text-muted tabular-nums">
                                    {formatKo(item.sizeBytes)}
                                </span>
                                {item.heavy && (
                                    <span className="uppercase tracking-[0.08em] px-1.5 py-0.5 border border-danger text-danger leading-none">
                                        Lourd
                                    </span>
                                )}
                            </div>
                            {item.usedBy ? (
                                <a
                                    href={item.usedBy.href}
                                    className="block text-[11px] text-primary hover:underline underline-offset-2 truncate"
                                >
                                    {FOLDER_LABELS[item.folder] ?? item.folder}{' '}
                                    · {item.usedBy.label}
                                </a>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={selected.has(item.key)}
                                            onChange={() =>
                                                toggleSelected(item.key)
                                            }
                                            className="accent-primary w-3.5 h-3.5"
                                        />
                                        Non utilisé
                                    </label>
                                    <button
                                        type="button"
                                        disabled={pending}
                                        onClick={() => setToDelete(item)}
                                        className="text-[11px] text-muted hover:text-danger transition-colors disabled:opacity-50"
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={toDelete !== null}
                title="Supprimer ce fichier ?"
                message={
                    toDelete
                        ? `${toDelete.key} sera définitivement supprimé du bucket.`
                        : ''
                }
                confirmLabel="Supprimer"
                onConfirm={confirmDelete}
                onCancel={() => setToDelete(null)}
            />

            <ConfirmDialog
                open={bulkConfirm}
                title="Supprimer la sélection ?"
                message={`${selected.size} fichier${selected.size !== 1 ? 's' : ''} sera${selected.size !== 1 ? 'ont' : ''} définitivement supprimé${selected.size !== 1 ? 's' : ''} du bucket.`}
                confirmLabel="Supprimer"
                onConfirm={confirmBulkDelete}
                onCancel={() => setBulkConfirm(false)}
            />
        </div>
    );
}
