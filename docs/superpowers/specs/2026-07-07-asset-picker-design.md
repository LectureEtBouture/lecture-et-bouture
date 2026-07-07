# Réutilisation d'assets digitaux — Livres, Boutures, Blog, Événements

## Objectif

Permettre de choisir une image déjà uploadée (n'importe quel dossier) au lieu
d'en re-uploader une, depuis les 4 forms admin (`LivreFormLibrairie`,
`PlanteFormContenu`, `ArticleFormIdentite`, `EvenementForm`) qui utilisent
toutes `components/admin/ImageUpload.tsx`.

## Accès

Tout utilisateur authentifié back-office (`auth()` seul, pas de check de
rôle) — cohérent avec l'accès actuel des 4 forms. Pas de restriction
`admin`/`super_admin` (contrairement à `/admin/stockage`) car ces forms sont
utilisées par tous les rôles (`editor`, `moderator`, `contributor`, etc).

## Data

### `lib/actions/storage.ts` — nouvelle action

```ts
'use server';
export async function listStorageAssets(): Promise<StorageItem[]>
```

- Check `auth()` (session existe) — pas de `requireAdmin()`.
- Appelle `getStorageOverview()` (déjà existant dans `lib/queries/storage.ts`,
  inchangé) et retourne `items`.
- Pas de mutation, pas de nouvelle table, pas de nouvelle route API — lecture
  seule du bucket + des 4 tables déjà exposées par `getStorageOverview`.

## UI

### `components/ui/AssetPickerModal.tsx` (nouveau, `'use client'`, atomic)

Modal `<dialog>` natif + `showModal()`, même pattern que
`app/admin/(protected)/stockage/_components/ConfirmDialog.tsx`.

Props :

```ts
type Props = {
    open: boolean;
    defaultFolder: 'livres' | 'boutures' | 'evenements' | 'blog';
    onSelect: (url: string) => void;
    onClose: () => void;
};
```

Comportement :

- À l'ouverture (`open: true` sur un modal qui n'a pas encore chargé), fetch
  `listStorageAssets()` via `useEffect` + state loading. Chargé une seule
  fois, réutilisé aux ouvertures suivantes.
- State local : recherche (filtre sur `key`, substring, insensible à la
  casse), tri (`date-desc` par défaut | `date-asc`), filtre dossier
  (`tous | livres | boutures | evenements | blog`, initialisé à
  `defaultFolder`).
- Filtrage/tri 100% client (même pattern que `StockageBrowser`, dataset
  petit).
- Grille thumbnails (réutilise le style de `StockageBrowser` : `<img>`
  `aspect-square object-cover`, nom de fichier tronqué, badge "Lourd" si
  `heavy`, badge usage `{FOLDER_LABELS[folder]} · {label}` si `usedBy`
  non-null — informatif seulement, ne bloque pas la sélection).
- Clic sur une thumbnail → `onSelect(item.url)` puis `onClose()`.
- État vide : "Aucun fichier pour cette recherche."

### `components/admin/ImageUpload.tsx` — modifié

- `Mode` devient `'fichier' | 'bibliotheque' | 'url'`.
- Nouveau tab "Bibliothèque" entre Fichier et URL.
- En mode `bibliotheque` : bouton "Choisir une image" ouvre
  `<AssetPickerModal defaultFolder={folder} onSelect={setUrl} ... />`.
- Sélection → `setUrl(url)`, comportement de preview/alt-text/suppression
  inchangé (identique aux modes existants : la preview + input alt-text
  s'affichent dès que `url` est non-vide, peu importe le mode qui l'a
  rempli).
- `altText` n'est jamais pré-rempli par la bibliothèque (pas de source
  fiable pour l'alt d'un asset déjà uploadé) — l'utilisateur le renseigne
  manuellement, comme aujourd'hui pour le mode URL.

## Hors scope

- Pas de suppression/renommage depuis le picker (déjà géré par
  `/admin/stockage`).
- Pas de pagination serveur.
- Pas de upload multiple depuis le picker.
- Pas de recherche par contenu d'image (juste nom de fichier).
