@AGENTS.md

# Conventions de code

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
