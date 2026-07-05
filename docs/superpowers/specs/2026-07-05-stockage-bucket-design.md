# Gestion du stockage bucket — back-office

## Objectif

Page `/admin/stockage` : voir l'espace utilisé sur le bucket (quota fixe 10 Go),
lister tous les assets, filtrer par usage, repérer les fichiers lourds et
supprimer ceux qui sont inutilisés.

## Accès

Rôles `admin` et `super_admin` uniquement. Check dans `page.tsx` :
`if (!['admin','super_admin'].includes(session?.user?.role)) notFound()`
(même pattern que `/admin/logs`).

## Données

### `lib/queries/storage.ts`

```ts
export const STORAGE_QUOTA_BYTES = 10_000_000_000; // 10 Go

export type StorageUsage = {
    type: 'livre' | 'bouture' | 'evenement' | 'article';
    label: string;
    href: string;
} | null;

export type StorageItem = {
    key: string; // ex: livres/172...-abc.webp
    folder: 'livres' | 'boutures' | 'evenements' | 'blog' | string;
    url: string; // /api/images/${key}
    sizeBytes: number;
    lastModified: Date;
    usedBy: StorageUsage;
    heavy: boolean; // sizeBytes > 400_000
};

export async function getStorageOverview(): Promise<{
    items: StorageItem[];
    totalBytes: number;
    quotaBytes: number;
}>;
```

Implémentation :

1. `minioClient.listObjects(BUCKET, '', true)` (stream) → accumuler
   `{key, size, lastModified}` pour tout le bucket.
2. Requêter en parallèle les colonnes `image` non-nulles de `livres`,
   `plantes`, `articles`, `evenements` (id + label d'affichage : `titre`/`nom`
    - slug pour le lien vers la fiche BO).
3. Construire une `Map<url, StorageUsage>` à partir de ces 4 requêtes
   (`url` = valeur stockée en base, déjà au format `/api/images/<key>`).
4. Pour chaque objet bucket, dossier = premier segment du `key`
   (`livres/`, `boutures/`, `evenements/`, `blog/`) ; `usedBy` = lookup dans
   la map par url reconstruite ; `heavy` = `size > 400_000`.
5. Retourner triés par `sizeBytes` décroissant (les plus gros en premier —
   ce sont les candidats prioritaires au nettoyage).

Pas de cache — page admin authentifiée (déjà dynamique via `auth()`),
le stockage doit refléter l'état réel à chaque visite.

### `lib/actions/storage.ts`

```ts
'use server';
export async function deleteStorageObject(
    key: string,
): Promise<{ ok: true } | { ok: false; error: string }>;
```

- `requireAdmin()` (session check, pattern existant).
- Revérifie côté serveur que l'objet n'est référencé nulle part (relit les 4
  tables) — défense en profondeur même si le bouton delete est masqué côté
  UI pour les assets utilisés. Si utilisé → retourne `{ok:false, error:...}`
  sans supprimer.
- `minioClient.removeObject(BUCKET, key)`.
- `createLog({ action: 'stockage.delete', entityType: 'stockage', entityLabel: key })`.
- `revalidatePath('/admin/stockage')`.

## UI

### `app/admin/(protected)/stockage/page.tsx`

Server Component : auth + role check, `getStorageOverview()`, rend
`<StockageBrowser items={...} totalBytes={...} quotaBytes={...} />`.

### `_components/StorageQuotaBar.tsx`

Barre de progression simple (pas de state, calcul pur) : pourcentage,
couleur `primary` en dessous de 80%, couleur d'avertissement au-delà
(token Tailwind existant, pas de hex).

### `_components/StockageBrowser.tsx` (`'use client'`)

- State local : filtre dossier (`tous | livres | boutures | evenements |
blog | non-utilisés`), toggle "lourds uniquement".
- Filtrage 100% client (dataset petit, pas de pagination serveur — cohérent
  avec `LivresTable`/`BouturesTable`).
- Liste : miniature (`<img>` vers `item.url`), clé, dossier, taille
  formatée, badge usage (lien vers la fiche si utilisé, sinon "Non utilisé"),
  badge "Lourd" si `heavy`.
- Bouton Supprimer visible uniquement si `usedBy === null`. Au clic → ouvre
  `ConfirmDialog`. Confirmation → `startTransition(() => deleteStorageObject(key))`,
  résultat → `Toast` succès/erreur, retire l'item de la liste locale si ok.

### `_components/ConfirmDialog.tsx` (nouveau, admin-only)

Modal minimaliste (`<dialog>` natif + `showModal()`), titre + message +
boutons Annuler/Confirmer. Réutilisable pour de futures confirmations
admin.

### `_components/Toast.tsx` + `_components/ToastProvider.tsx` (nouveau)

Toast succès/erreur, style aligné sur `components/ui/NudgeToast.tsx`
(mêmes tokens `surface`/`border`/`muted`/`primary`, position `fixed
bottom-6 right-6`, auto-dismiss ~3s). Provider posé dans `AdminShell` pour
être disponible sur toutes les pages admin (réutilisable au-delà de cette
feature).

## Nav

Ajouter `{ href: '/admin/stockage', label: 'Stockage' }` dans
`getAdminSectionItems` (`AdminShell.tsx`), visible pour `admin` et
`super_admin`.

## Hors scope

- Pas de re-compression automatique — juste un badge "Lourd" informatif.
- Pas de suppression en masse.
- Pas de pagination serveur (dataset attendu petit pour une boutique).
- Pas de route API REST dédiée — Server Actions, cohérent avec le reste du
  back-office.
