# Gestion du stockage bucket — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Page `/admin/stockage` pour voir l'espace utilisé sur le bucket (quota fixe 10 Go), lister tous les assets avec leur usage (livre/bouture/événement/blog/aucun), repérer les fichiers lourds et supprimer ceux qui sont inutilisés.

**Architecture:** Server Component (`page.tsx`) fetch tout via une query serveur qui croise `minioClient.listObjects` avec les colonnes `image` de 4 tables Drizzle, passe les données à un composant client qui gère filtre/tri/suppression en local (pas de pagination serveur — dataset petit). Suppression via Server Action, jamais de route API dédiée (cohérent avec le reste du back-office).

**Tech Stack:** Next.js 16 (App Router, Server Actions), Drizzle ORM, `minio` npm client (déjà en place, voir `lib/minio.ts`), Tailwind (tokens `globals.css`).

## Global Constraints

- Pas de framework de test dans ce repo (`package.json` n'a pas de script `test`, aucun `.test.ts` nulle part). Vérification de chaque tâche : `npx tsc --noEmit -p tsconfig.json`, `npx eslint <fichiers>`, et vérification manuelle via `npm run dev` pour les tâches avec effet visible.
- Couleurs : uniquement les tokens Tailwind existants — `primary`, `primary-light`, `background`, `foreground`, `muted`, `border`, `surface`, `danger`. Jamais de hex dans les classes.
- Pas de lettre seule dans les callbacks (`map`/`filter`/`find`) — sauf `(a, b)` dans `.sort()`.
- Commentaires : `// Titre` uniquement, pas de blocs décoratifs.
- Rôles autorisés sur `/admin/stockage` : `admin` et `super_admin` uniquement.
- Bouton Supprimer visible uniquement si l'asset n'est référencé par aucune des 4 tables (`livres`, `plantes`, `articles`, `evenements`).
- Seuil "fichier lourd" : `> 400_000` octets.
- Quota fixe : `10_000_000_000` octets (10 Go décimal).

---

### Task 1: Query serveur — inventaire du bucket

**Files:**

- Create: `lib/queries/storage.ts`

**Interfaces:**

- Consumes: `minioClient`, `BUCKET` from `@/lib/minio` (déjà existants — `minioClient: import('minio').Client`, `BUCKET: string`); `db` from `@/db`; `livres`, `plantes`, `articles`, `evenements` from `@/db/schema`.
- Produces:
    - `STORAGE_QUOTA_BYTES: number` (= `10_000_000_000`)
    - `type StorageUsage = { type: 'livre' | 'bouture' | 'evenement' | 'article'; label: string; href: string } | null`
    - `type StorageItem = { key: string; folder: string; url: string; sizeBytes: number; lastModified: Date; usedBy: StorageUsage; heavy: boolean }`
    - `getStorageOverview(): Promise<{ items: StorageItem[]; totalBytes: number; quotaBytes: number }>`
    - `isUrlInUse(url: string): Promise<boolean>` (utilisé par Task 2)

- [ ] **Step 1: Écrire `lib/queries/storage.ts`**

```ts
import { isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { articles, evenements, livres, plantes } from '@/db/schema';
import { BUCKET, minioClient } from '@/lib/minio';
import type { BucketItem } from 'minio';

export const STORAGE_QUOTA_BYTES = 10_000_000_000; // 10 Go
const HEAVY_THRESHOLD_BYTES = 400_000;

export type StorageUsage = {
    type: 'livre' | 'bouture' | 'evenement' | 'article';
    label: string;
    href: string;
} | null;

export type StorageItem = {
    key: string;
    folder: string;
    url: string;
    sizeBytes: number;
    lastModified: Date;
    usedBy: StorageUsage;
    heavy: boolean;
};

function listAllObjects(): Promise<BucketItem[]> {
    return new Promise((resolve, reject) => {
        const items: BucketItem[] = [];
        const stream = minioClient.listObjects(BUCKET, '', true);
        stream.on('data', (item) => items.push(item));
        stream.on('end', () => resolve(items));
        stream.on('error', reject);
    });
}

async function buildUsageIndex(): Promise<Map<string, StorageUsage>> {
    const [livresRows, plantesRows, articlesRows, evenementsRows] =
        await Promise.all([
            db
                .select({
                    id: livres.id,
                    titre: livres.titre,
                    image: livres.image,
                })
                .from(livres)
                .where(isNotNull(livres.image)),
            db
                .select({
                    id: plantes.id,
                    nom: plantes.nom,
                    image: plantes.image,
                })
                .from(plantes)
                .where(isNotNull(plantes.image)),
            db
                .select({
                    id: articles.id,
                    titre: articles.titre,
                    image: articles.image,
                })
                .from(articles)
                .where(isNotNull(articles.image)),
            db
                .select({
                    id: evenements.id,
                    titre: evenements.titre,
                    image: evenements.image,
                })
                .from(evenements)
                .where(isNotNull(evenements.image)),
        ]);

    const index = new Map<string, StorageUsage>();
    for (const livre of livresRows) {
        if (livre.image)
            index.set(livre.image, {
                type: 'livre',
                label: livre.titre ?? 'Livre sans titre',
                href: `/admin/livres/${livre.id}/modifier`,
            });
    }
    for (const plante of plantesRows) {
        if (plante.image)
            index.set(plante.image, {
                type: 'bouture',
                label: plante.nom,
                href: `/admin/boutures/${plante.id}/modifier`,
            });
    }
    for (const article of articlesRows) {
        if (article.image)
            index.set(article.image, {
                type: 'article',
                label: article.titre,
                href: `/admin/blog/${article.id}/modifier`,
            });
    }
    for (const evenement of evenementsRows) {
        if (evenement.image)
            index.set(evenement.image, {
                type: 'evenement',
                label: evenement.titre,
                href: `/admin/evenements/${evenement.id}/modifier`,
            });
    }
    return index;
}

export async function isUrlInUse(url: string): Promise<boolean> {
    const index = await buildUsageIndex();
    return index.has(url);
}

export async function getStorageOverview(): Promise<{
    items: StorageItem[];
    totalBytes: number;
    quotaBytes: number;
}> {
    const [objects, usageIndex] = await Promise.all([
        listAllObjects(),
        buildUsageIndex(),
    ]);

    const items: StorageItem[] = [];
    for (const object of objects) {
        if (!object.name) continue; // entrée "prefix" (non utilisée en mode recursive)
        const url = `/api/images/${object.name}`;
        items.push({
            key: object.name,
            folder: object.name.split('/')[0] ?? object.name,
            url,
            sizeBytes: object.size,
            lastModified: object.lastModified,
            usedBy: usageIndex.get(url) ?? null,
            heavy: object.size > HEAVY_THRESHOLD_BYTES,
        });
    }
    items.sort((a, b) => b.sizeBytes - a.sizeBytes);

    const totalBytes = items.reduce((sum, item) => sum + item.sizeBytes, 0);

    return { items, totalBytes, quotaBytes: STORAGE_QUOTA_BYTES };
}
```

- [ ] **Step 2: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: aucune erreur.

- [ ] **Step 3: Lint**

Run: `npx eslint lib/queries/storage.ts`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add lib/queries/storage.ts
git commit -m "$(cat <<'EOF'
feat(admin): query inventaire bucket avec croisement usage BDD

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Server Action — suppression d'un asset

**Files:**

- Create: `lib/actions/storage.ts`

**Interfaces:**

- Consumes: `isUrlInUse(url: string): Promise<boolean>` from Task 1 (`@/lib/queries/storage`); `minioClient`, `BUCKET` from `@/lib/minio`; `createLog` from `@/lib/actions/admin-logs` (signature existante : `createLog(params: { action: string; entityType?: string; entityId?: string; entityLabel?: string }): Promise<void>`); `auth` from `@/auth`.
- Produces: `deleteStorageObject(key: string): Promise<{ ok: true } | { ok: false; error: string }>` (consommé par Task 5).

- [ ] **Step 1: Écrire `lib/actions/storage.ts`**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { BUCKET, minioClient } from '@/lib/minio';
import { isUrlInUse } from '@/lib/queries/storage';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

export async function deleteStorageObject(
    key: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    await requireAdmin();

    const url = `/api/images/${key}`;
    if (await isUrlInUse(url)) {
        return {
            ok: false,
            error: 'Ce fichier est utilisé par une fiche — suppression refusée.',
        };
    }

    await minioClient.removeObject(BUCKET, key);
    await createLog({
        action: 'stockage.delete',
        entityType: 'stockage',
        entityLabel: key,
    });
    revalidatePath('/admin/stockage');

    return { ok: true };
}
```

- [ ] **Step 2: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: aucune erreur.

- [ ] **Step 3: Lint**

Run: `npx eslint lib/actions/storage.ts`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add lib/actions/storage.ts
git commit -m "$(cat <<'EOF'
feat(admin): server action suppression asset bucket

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Primitives UI admin — ConfirmDialog + ToastProvider

**Files:**

- Create: `app/admin/(protected)/_components/ConfirmDialog.tsx`
- Create: `app/admin/(protected)/_components/ToastProvider.tsx`
- Modify: `app/admin/(protected)/_components/AdminShell.tsx`

**Interfaces:**

- Produces:
    - `ConfirmDialog(props: { open: boolean; title: string; message: string; confirmLabel?: string; onConfirm: () => void; onCancel: () => void }): JSX.Element` (consommé par Task 5)
    - `ToastProvider({ children }: { children: React.ReactNode }): JSX.Element`
    - `useToast(): (message: string, variant: 'success' | 'error') => void` (consommé par Task 5)

Ces deux composants sont des primitives back-office réutilisables (pas de logique métier stockage) — ils vivent dans `_components/` au niveau `(protected)`, pas dans `stockage/_components/`.

- [ ] **Step 1: Écrire `app/admin/(protected)/_components/ConfirmDialog.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirmer',
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onCancel={onCancel}
            className="backdrop:bg-foreground/20 border border-border bg-surface p-6 max-w-sm w-full"
        >
            <p className="font-serif text-base font-bold text-foreground mb-2">
                {title}
            </p>
            <p className="text-sm text-muted mb-5">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-muted hover:text-foreground transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="bg-primary text-background px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-medium hover:bg-primary-light transition-colors"
                >
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
```

- [ ] **Step 2: Écrire `app/admin/(protected)/_components/ToastProvider.tsx`**

```tsx
'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type ToastVariant = 'success' | 'error';
type ToastItem = { id: number; message: string; variant: ToastVariant };

const ToastContext = createContext<
    ((message: string, variant: ToastVariant) => void) | null
>(null);

export function useToast() {
    const showToast = useContext(ToastContext);
    if (!showToast)
        throw new Error('useToast doit être utilisé dans un ToastProvider');
    return showToast;
}

let nextToastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, variant: ToastVariant) => {
        const id = nextToastId++;
        setToasts((current) => [...current, { id, message, variant }]);
        setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        aria-live="polite"
                        className={`bg-surface border px-4 py-3 text-sm shadow-[0_2px_12px_rgba(26,26,26,0.06)] ${
                            toast.variant === 'error'
                                ? 'border-danger text-danger'
                                : 'border-border text-foreground'
                        }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
```

- [ ] **Step 3: Brancher `ToastProvider` dans `AdminShell.tsx`**

Lire d'abord le fichier pour repérer les lignes exactes (le contenu peut légèrement bouger d'ici l'exécution) — chercher `export function AdminShell` et son `return (`.

Ajouter l'import en haut du fichier :

```tsx
import { ToastProvider } from './ToastProvider';
```

Envelopper le contenu retourné par `AdminShell` (actuellement un `<div className="min-h-screen bg-background">...</div>`) :

```tsx
return (
    <ToastProvider>
        <div className="min-h-screen bg-background">
            {/* ... contenu existant inchangé ... */}
        </div>
    </ToastProvider>
);
```

Ne rien changer d'autre à l'intérieur du `div` — uniquement ajouter l'import et les deux balises `<ToastProvider>`/`</ToastProvider>` autour du `return`.

- [ ] **Step 4: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: aucune erreur.

- [ ] **Step 5: Lint**

Run: `npx eslint app/admin/\(protected\)/_components/ConfirmDialog.tsx app/admin/\(protected\)/_components/ToastProvider.tsx app/admin/\(protected\)/_components/AdminShell.tsx`
Expected: aucune erreur.

- [ ] **Step 6: Vérification manuelle rapide**

Run: `npm run dev`, se connecter en admin, vérifier que le back-office s'affiche normalement (aucune régression visuelle — le `ToastProvider` ne doit rien changer tant que `showToast` n'est pas appelé).

- [ ] **Step 7: Commit**

```bash
git add "app/admin/(protected)/_components/ConfirmDialog.tsx" "app/admin/(protected)/_components/ToastProvider.tsx" "app/admin/(protected)/_components/AdminShell.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): primitives ConfirmDialog + ToastProvider réutilisables

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Barre de quota

**Files:**

- Create: `app/admin/(protected)/stockage/_components/StorageQuotaBar.tsx`

**Interfaces:**

- Produces: `StorageQuotaBar(props: { totalBytes: number; quotaBytes: number }): JSX.Element` (consommé par Task 6)

- [ ] **Step 1: Écrire `app/admin/(protected)/stockage/_components/StorageQuotaBar.tsx`**

```tsx
function formatGo(bytes: number) {
    return (bytes / 1_000_000_000).toFixed(2);
}

export function StorageQuotaBar({
    totalBytes,
    quotaBytes,
}: {
    totalBytes: number;
    quotaBytes: number;
}) {
    const percent = Math.min(100, (totalBytes / quotaBytes) * 100);
    const warning = percent > 80;

    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground">
                    {formatGo(totalBytes)} Go / {formatGo(quotaBytes)} Go
                </span>
                <span className="text-[11px] text-muted">
                    {percent.toFixed(1)}%
                </span>
            </div>
            <div className="h-2 bg-border/40 overflow-hidden">
                <div
                    className={`h-full transition-[width] ${warning ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Vérifier les types et le lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint "app/admin/(protected)/stockage/_components/StorageQuotaBar.tsx"`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add "app/admin/(protected)/stockage/_components/StorageQuotaBar.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): barre de quota stockage

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Liste filtrable + suppression

**Files:**

- Create: `app/admin/(protected)/stockage/_components/StockageBrowser.tsx`

**Interfaces:**

- Consumes:
    - `StorageItem` type from Task 1 (`@/lib/queries/storage`)
    - `deleteStorageObject(key: string): Promise<{ ok: true } | { ok: false; error: string }>` from Task 2 (`@/lib/actions/storage`)
    - `ConfirmDialog`, `useToast` from Task 3 (`@/app/admin/(protected)/_components/ConfirmDialog`, `@/app/admin/(protected)/_components/ToastProvider`)
- Produces: `StockageBrowser(props: { items: StorageItem[] }): JSX.Element` (consommé par Task 6)

- [ ] **Step 1: Écrire `app/admin/(protected)/stockage/_components/StockageBrowser.tsx`**

```tsx
'use client';

import { useState, useTransition } from 'react';
import { ConfirmDialog } from '@/app/admin/(protected)/_components/ConfirmDialog';
import { useToast } from '@/app/admin/(protected)/_components/ToastProvider';
import { deleteStorageObject } from '@/lib/actions/storage';
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
    const showToast = useToast();

    const filtered = items.filter((item) => {
        if (heavyOnly && !item.heavy) return false;
        if (folder === 'tous') return true;
        if (folder === 'non-utilises') return item.usedBy === null;
        return item.folder === folder;
    });

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
                                    <span className="text-[11px] text-muted">
                                        Non utilisé
                                    </span>
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
        </div>
    );
}
```

- [ ] **Step 2: Vérifier les types et le lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint "app/admin/(protected)/stockage/_components/StockageBrowser.tsx"`
Expected: aucune erreur.

- [ ] **Step 3: Commit**

```bash
git add "app/admin/(protected)/stockage/_components/StockageBrowser.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): navigateur stockage — filtres, badges usage, suppression

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Page, nav, vérification bout-en-bout

**Files:**

- Create: `app/admin/(protected)/stockage/page.tsx`
- Modify: `app/admin/(protected)/_components/AdminShell.tsx` (fonction `getAdminSectionItems`)

**Interfaces:**

- Consumes: `getStorageOverview()` from Task 1; `StorageQuotaBar` from Task 4; `StockageBrowser` from Task 5.

- [ ] **Step 1: Écrire `app/admin/(protected)/stockage/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getStorageOverview } from '@/lib/queries/storage';
import { StockageBrowser } from './_components/StockageBrowser';
import { StorageQuotaBar } from './_components/StorageQuotaBar';

export default async function StockagePage() {
    const session = await auth();
    if (!['admin', 'super_admin'].includes(session?.user?.role ?? ''))
        notFound();

    const { items, totalBytes, quotaBytes } = await getStorageOverview();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Stockage
                </h1>
                <p className="text-[11px] text-muted mt-0.5">
                    {items.length} fichier{items.length !== 1 ? 's' : ''} dans
                    le bucket
                </p>
            </div>
            <StorageQuotaBar totalBytes={totalBytes} quotaBytes={quotaBytes} />
            <StockageBrowser items={items} />
        </div>
    );
}
```

- [ ] **Step 2: Ajouter le lien nav dans `AdminShell.tsx`**

Modifier `getAdminSectionItems` (déjà présent, ~ligne 23) :

```ts
function getAdminSectionItems(role?: string) {
    const items = [{ href: '/admin/parametres', label: 'Paramètres' }];
    if (role === 'super_admin' || role === 'admin') {
        items.push({ href: '/admin/users', label: 'Utilisateurs' });
        items.push({ href: '/admin/stockage', label: 'Stockage' });
    }
    if (role === 'super_admin') {
        items.push({ href: '/admin/logs', label: 'Journaux' });
    }
    return items;
}
```

- [ ] **Step 3: Vérifier les types et le lint**

Run: `npx tsc --noEmit -p tsconfig.json && npx eslint "app/admin/(protected)/stockage/page.tsx" "app/admin/(protected)/_components/AdminShell.tsx"`
Expected: aucune erreur.

- [ ] **Step 4: Vérification manuelle bout-en-bout**

Run: `npm run dev`

1. Se connecter en tant qu'utilisateur `admin` ou `super_admin`.
2. Vérifier que "Stockage" apparaît dans la nav (section Administration), desktop et mobile.
3. Ouvrir `/admin/stockage` : la barre de quota s'affiche, la liste des fichiers du bucket apparaît (via `/api/images/...`), triée par taille décroissante.
4. Tester chaque filtre (Livres/Boutures/Événements/Blog/Non utilisés) et le toggle "lourds".
5. Cliquer sur un badge d'usage → doit rediriger vers la fiche BO correspondante.
6. Uploader une image de test via une fiche existante (ex: `/admin/blog/nouveau`) sans la rattacher à un article (upload puis ne pas enregistrer le formulaire) pour obtenir un fichier "orphelin" dans le bucket, ou repérer un fichier déjà non utilisé.
7. Sur un fichier non utilisé : cliquer Supprimer → `ConfirmDialog` s'ouvre → Confirmer → toast succès → fichier disparaît de la liste.
8. Vérifier `/admin/logs` (si `super_admin`) : une entrée `stockage.delete` doit apparaître.
9. Se connecter avec un rôle `editor`/`moderator`/`contributor` (ou modifier temporairement son propre rôle en base pour le test) → `/admin/stockage` doit renvoyer 404.

- [ ] **Step 5: Commit**

```bash
git add "app/admin/(protected)/stockage/page.tsx" "app/admin/(protected)/_components/AdminShell.tsx"
git commit -m "$(cat <<'EOF'
feat(admin): page /admin/stockage + entrée nav

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
