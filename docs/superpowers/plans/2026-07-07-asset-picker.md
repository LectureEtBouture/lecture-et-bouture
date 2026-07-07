# Réutilisation d'assets digitaux — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Depuis les 4 forms admin (Livre, Bouture, Blog, Événement), permettre de choisir une image déjà uploadée dans n'importe quel dossier du bucket au lieu d'en re-uploader une, via un nouveau tab "Bibliothèque" dans `ImageUpload.tsx` qui ouvre un modal de sélection.

**Architecture:** Nouvelle Server Action `listStorageAssets()` (lecture seule, réutilise `getStorageOverview()` existant) exposée à un nouveau composant client atomic `AssetPickerModal` (`components/ui/`), lui-même branché dans `ImageUpload.tsx` comme 3e mode à côté de Fichier/URL. Filtrage/tri/recherche 100% côté client (dataset petit, cohérent avec `StockageBrowser`).

**Tech Stack:** Next.js 16 (App Router, Server Actions), React (Client Components), Tailwind (tokens `globals.css`).

## Global Constraints

- Pas de framework de test dans ce repo (`package.json` n'a pas de script `test`). Vérification de chaque tâche : `npx tsc --noEmit -p tsconfig.json`, `npx eslint <fichiers>`, vérification manuelle via `npm run dev` pour les tâches avec effet visible.
- Couleurs : uniquement les tokens Tailwind existants — `primary`, `primary-light`, `background`, `foreground`, `muted`, `border`, `surface`, `danger`. Jamais de hex dans les classes.
- Pas de lettre seule dans les callbacks (`map`/`filter`/`find`) — sauf `(a, b)` dans `.sort()` et `(_, i)`.
- Commentaires : `// Titre` uniquement, pas de blocs décoratifs.
- Accès au picker : tout utilisateur authentifié (`auth()` seul, pas de restriction de rôle) — cohérent avec l'accès actuel des 4 forms qui utilisent `ImageUpload`.
- Sélection d'un asset existant n'est jamais bloquée par un usage ailleurs (`usedBy`) — c'est justement le but (réutilisation), le badge est informatif seulement.

---

### Task 1: Server Action — lister les assets pour le picker

**Files:**

- Modify: `lib/actions/storage.ts`

**Interfaces:**

- Consumes: `getStorageOverview(): Promise<{ items: StorageItem[]; totalBytes: number; quotaBytes: number }>` from `@/lib/queries/storage` (déjà existant, inchangé); `auth` from `@/auth` (déjà importé dans ce fichier).
- Produces: `listStorageAssets(): Promise<StorageItem[]>` (consommé par Task 2).

Le fichier actuel (`lib/actions/storage.ts`) contient déjà `requireAdmin()` (check de rôle `admin`/`super_admin`, utilisé par `deleteStorageObject`/`deleteStorageObjects`) — **ne pas réutiliser cette fonction ici**, le picker doit être accessible à tous les rôles authentifiés.

- [ ] **Step 1: Ajouter l'import de `getStorageOverview` et `StorageItem`**

En haut de `lib/actions/storage.ts`, modifier la ligne d'import existante :

```ts
import { getStorageOverview, isUrlInUse } from '@/lib/queries/storage';
import type { StorageItem } from '@/lib/queries/storage';
```

(remplace la ligne actuelle `import { isUrlInUse } from '@/lib/queries/storage';`)

- [ ] **Step 2: Ajouter `listStorageAssets` en fin de fichier**

```ts
export async function listStorageAssets(): Promise<StorageItem[]> {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const { items } = await getStorageOverview();
    return items;
}
```

- [ ] **Step 3: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: aucune erreur.

- [ ] **Step 4: Lint**

Run: `npx eslint lib/actions/storage.ts`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add lib/actions/storage.ts
git commit -m "$(cat <<'EOF'
feat(admin): server action listStorageAssets pour réutilisation d'assets

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Composant `AssetPickerModal`

**Files:**

- Create: `components/ui/AssetPickerModal.tsx`

**Interfaces:**

- Consumes: `listStorageAssets(): Promise<StorageItem[]>` from Task 1 (`@/lib/actions/storage`); `StorageItem` type from `@/lib/queries/storage` (`{ key: string; folder: string; url: string; sizeBytes: number; lastModified: Date; usedBy: StorageUsage; heavy: boolean }`, `StorageUsage = { type: string; label: string; href: string } | null`).
- Produces: `AssetPickerModal(props: { open: boolean; defaultFolder: 'livres' | 'boutures' | 'evenements' | 'blog'; onSelect: (url: string) => void; onClose: () => void }): JSX.Element` (consommé par Task 3).

- [ ] **Step 1: Écrire `components/ui/AssetPickerModal.tsx`**

```tsx
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
```

- [ ] **Step 2: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: aucune erreur.

- [ ] **Step 3: Lint**

Run: `npx eslint components/ui/AssetPickerModal.tsx`
Expected: aucune erreur.

- [ ] **Step 4: Commit**

```bash
git add components/ui/AssetPickerModal.tsx
git commit -m "$(cat <<'EOF'
feat(admin): AssetPickerModal — modal de sélection d'assets réutilisables

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Brancher le picker dans `ImageUpload.tsx`

**Files:**

- Modify: `components/admin/ImageUpload.tsx`

**Interfaces:**

- Consumes: `AssetPickerModal` from Task 2 (`@/components/ui/AssetPickerModal`).

Fichier actuel : voir `components/admin/ImageUpload.tsx` (177 lignes). `Mode` vaut actuellement `'fichier' | 'url'`, géré par `useState<Mode>`. Les tabs sont rendus via la fonction `tabBtn(m: Mode)` et deux `<button>` (lignes ~71-86). Le contenu conditionnel `mode === 'fichier'` est aux lignes ~88-122, `mode === 'url'` aux lignes ~124-132.

- [ ] **Step 1: Ajouter l'import et étendre le type `Mode`**

Remplacer :

```ts
type Mode = 'fichier' | 'url';
```

par :

```ts
type Mode = 'fichier' | 'bibliotheque' | 'url';
```

Ajouter en haut du fichier, avec les autres imports :

```ts
import { AssetPickerModal } from '@/components/ui/AssetPickerModal';
```

- [ ] **Step 2: Ajouter le state du modal**

Dans le corps de `ImageUpload`, à côté des autres `useState` :

```ts
const [pickerOpen, setPickerOpen] = useState(false);
```

- [ ] **Step 3: Ajouter le 3e tab, entre "Fichier" et "URL"**

Le bloc actuel des tabs :

```tsx
<div className="flex border border-border w-fit">
    <button
        type="button"
        onClick={() => setMode('fichier')}
        className={tabBtn('fichier')}
    >
        Fichier
    </button>
    <button
        type="button"
        onClick={() => setMode('url')}
        className={tabBtn('url')}
    >
        URL
    </button>
</div>
```

devient :

```tsx
<div className="flex border border-border w-fit">
    <button
        type="button"
        onClick={() => setMode('fichier')}
        className={tabBtn('fichier')}
    >
        Fichier
    </button>
    <button
        type="button"
        onClick={() => setMode('bibliotheque')}
        className={tabBtn('bibliotheque')}
    >
        Bibliothèque
    </button>
    <button
        type="button"
        onClick={() => setMode('url')}
        className={tabBtn('url')}
    >
        URL
    </button>
</div>
```

- [ ] **Step 4: Ajouter le contenu du mode "bibliotheque"**

Juste après le bloc `{mode === 'fichier' && (...)}` existant (avant `{mode === 'url' && (...)}`), ajouter :

```tsx
{
    mode === 'bibliotheque' && (
        <div>
            <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="border border-dashed border-border hover:border-primary p-8 w-full text-center transition-colors"
            >
                <p className="text-[11px] text-muted">
                    Choisir une image déjà uploadée
                </p>
            </button>
            <AssetPickerModal
                open={pickerOpen}
                defaultFolder={folder}
                onSelect={(selectedUrl) => {
                    setUrl(selectedUrl);
                    setPickerOpen(false);
                }}
                onClose={() => setPickerOpen(false)}
            />
        </div>
    );
}
```

- [ ] **Step 5: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: aucune erreur.

- [ ] **Step 6: Lint**

Run: `npx eslint components/admin/ImageUpload.tsx`
Expected: aucune erreur.

- [ ] **Step 7: Vérification manuelle bout-en-bout**

Run: `npm run dev`

1. Se connecter en admin (n'importe quel rôle).
2. Ouvrir `/admin/livres/nouveau` : le champ Image affiche 3 tabs Fichier/Bibliothèque/URL.
3. Cliquer "Bibliothèque" → bouton "Choisir une image déjà uploadée" → clic → modal s'ouvre, liste les assets (chargement puis grille).
4. Tester la recherche par nom (filtre en direct), le filtre dossier (défaut sur "Livres"), le tri date asc/desc.
5. Cliquer une thumbnail → modal se ferme, l'image apparaît en preview dans le form avec son URL, champ alt-text vide à remplir.
6. Refaire le test depuis `/admin/boutures/nouveau`, `/admin/blog/nouveau`, `/admin/evenements/nouveau` — vérifier que `defaultFolder` correspond bien (boutures/blog/evenements) et que les assets des 4 dossiers sont visibles via le filtre "Tous".
7. Vérifier qu'un asset avec badge usage (déjà utilisé par une autre fiche) reste sélectionnable normalement (pas de blocage).
8. Se connecter avec un rôle `editor`/`contributor` → vérifier que le tab Bibliothèque fonctionne aussi (pas de 401/redirect).

- [ ] **Step 8: Commit**

```bash
git add components/admin/ImageUpload.tsx
git commit -m "$(cat <<'EOF'
feat(admin): tab Bibliothèque dans ImageUpload pour réutiliser un asset existant

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```
