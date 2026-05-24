@AGENTS.md

## Toutes les règles cu dessous sont TOUJOURS à prendre en compte

Econimoe de tokens au possible.

- **Si ambigu** : Demande. Ne choisis pas en silence.
- **Diff minimaliste** : Touche uniquement ce qui est demandé.
- **Définis "Done"** : Avant de commencer, une ligne suffit.
- **Vérifie le code lastest** : Jamais d'hypothese.
- **Code minimaliste** : Pas de feature spéculative.

# Conventions de code

Pour ce qui est design, invoke le skill impeccable.

## Couleurs

Toujours utiliser les tokens Tailwind définis dans `globals.css`. Ne jamais écrire de hex codes dans les classes (`text-[#2D4B3E]` → `text-primary`).
Tokens disponibles : `primary`, `primary-light`, `background`, `foreground`, `muted`, `border`, `surface`.
Exception : couleurs dynamiques calculées au runtime (cover colors par genre/lumière) restent dans `style={{}}`.

## Nommage des variables

Pas de lettre seule dans les callbacks (map, filter, find, forEach, etc.).

- `(livre)` pas `(l)`, `(bouture)` pas `(p)`, `(genre)` pas `(g)`, `(rayon)` pas `(r)`
- Exception : `(a, b)` dans `.sort()` est accepté (convention universelle)
- Exception : `(_, i)` pour un index avec paramètre ignoré est accepté

## Commentaires

Format simple `// Titre` uniquement. Jamais de lignes décoratives (`// ─── Titre ───────`). Pas de JSDoc sauf si la signature ne se suffit pas.

## Formatage

Ne jamais reformater le code existant. ESLint + Prettier tournent automatiquement — ne pas perdre de tokens à remettre en forme ce qu'ils gèrent.

## Longueur des fichiers

Un fichier = une responsabilité. Cible : < 150 lignes.

- Les pages (`page.tsx`) ne font qu'orchestrer : fetch data + assemblage de composants. Pas de logique de rendu inline.
- Extraire dans `_components/` dès qu'un composant dépasse ~80 lignes ou est utilisé ailleurs.
- Les composants partagés entre routes vont dans `components/ui/`.

## Structure des composants partagés

- `components/ui/` — primitives UI réutilisables (Stars, AvisSection, filtres…)
- `app/[route]/_components/` — composants propres à une route
- `app/[route]/[slug]/_components/` — composants propres à une fiche

## Données

- JSON mock dans `data/` pour le développement front
- `lib/data.ts` — toutes les fonctions d'accès aux données
- Renommer cohérent : le concept s'appelle **boutures** (pas plantes) côté public

## Server / Client components

Tous les composants sont Server Components par défaut. Ne pas ajouter `'use client'` sauf si le composant a besoin de :

- `useState`, `useEffect`, hooks React
- event handlers (`onClick`, `onChange`, etc.)
- APIs navigateur (`localStorage`, `window`, etc.)

Quand un composant enfant doit être client, garder son parent server et lui passer les données en props.

## Cache (Next.js 16 — modèle sans `cacheComponents`)

`cacheComponents` n'est **pas** activé dans `next.config.ts`. Le modèle actif est l'ancien modèle :

**Pages statiques (défaut)** — pas de config nécessaire. Les pages sans accès à des données dynamiques (cookies, headers, searchParams) sont prérendues statiquement au build.

**Pages dynamiques par requête** — exporter `export const dynamic = 'force-dynamic'` depuis la page. Utiliser pour les pages qui ont besoin d'un résultat différent à chaque requête (ex : `/surprendre` avec `Math.random()`).

**Données non-fetch mises en cache** — utiliser `unstable_cache` de `next/cache` pour wrapper des fonctions accédant à la BDD ou à des fichiers JSON lourds, avec tags de revalidation.

**`Math.random()` et opérations non-déterministes** — fonctionnent dans ce modèle avec `force-dynamic`. Si `cacheComponents` est activé un jour, il faudra migrer vers `connection()` + `<Suspense>` (voir `app/surprendre/page.tsx`).

**Revalidation** — `revalidateTag('tag')` depuis une Server Action pour invalider le cache après mutation en back-office.
