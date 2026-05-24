# Migration JSON → PostgreSQL — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher tout le front public sur PostgreSQL (Drizzle) en remplaçant les fonctions JSON de `lib/data.ts`, et ajouter le CRUD admin pour les genres et rayons.

**Architecture:** Deux nouveaux fichiers de queries publiques (`lib/queries/livres.ts`, `lib/queries/boutures.ts`) suivant le pattern existant de `lib/queries/selections.ts` — fonctions `async` avec `unstable_cache` + tags de revalidation. Les actions admin existantes (`lib/actions/livres.ts`, `lib/actions/plantes.ts`) récupèrent un `revalidateTag` pour invalider le cache public. `lib/data.ts` est réduit aux constantes et helpers purs (couleurs, labels).

**Tech Stack:** Next.js 16 App Router, Drizzle ORM, PostgreSQL, `unstable_cache` (next/cache), `revalidateTag`

---

## Cartographie des fichiers

| Fichier                                                     | Action   | Rôle après migration                              |
| ----------------------------------------------------------- | -------- | ------------------------------------------------- |
| `lib/queries/livres.ts`                                     | Créer    | Queries publiques livres + genres + rayons        |
| `lib/queries/boutures.ts`                                   | Créer    | Queries publiques boutures                        |
| `lib/actions/genres.ts`                                     | Créer    | CRUD admin genres                                 |
| `lib/actions/rayons.ts`                                     | Créer    | CRUD admin rayons                                 |
| `lib/actions/livres.ts`                                     | Modifier | Ajouter `revalidateTag('livres')` aux mutations   |
| `lib/actions/plantes.ts`                                    | Modifier | Ajouter `revalidateTag('boutures')` aux mutations |
| `lib/data.ts`                                               | Modifier | Garder uniquement constantes + helpers purs       |
| `app/(front)/page.tsx`                                      | Modifier | Async, appels DB                                  |
| `app/(front)/livres/page.tsx`                               | Modifier | Async, appels DB                                  |
| `app/(front)/livres/[slug]/page.tsx`                        | Modifier | Async, appels DB parallèles                       |
| `app/(front)/livres/[slug]/opengraph-image.tsx`             | Modifier | Async, appels DB                                  |
| `app/(front)/boutures/page.tsx`                             | Modifier | Async, appel DB                                   |
| `app/(front)/boutures/[slug]/page.tsx`                      | Modifier | Async, `image` (string) vs `images[]`             |
| `app/(front)/boutures/[slug]/opengraph-image.tsx`           | Modifier | Async, appel DB                                   |
| `app/(front)/surprendre/page.tsx`                           | Modifier | Async, appel DB                                   |
| `app/sitemap.ts`                                            | Modifier | Async, appels DB                                  |
| `app/(front)/_components/LivresSection.tsx`                 | Modifier | Type `LivrePublique`                              |
| `app/(front)/livres/_components/FilterBar.tsx`              | Modifier | Types `SortLivres`, `Genre`, `Rayon`              |
| `app/(front)/livres/[slug]/_components/CoverPanel.tsx`      | Modifier | Types `LivrePublique`, `RayonPublique`            |
| `app/(front)/livres/[slug]/_components/LivreBreadcrumb.tsx` | Modifier | Types `GenrePublique`, `RayonPublique`            |
| `app/(front)/livres/[slug]/_components/RecoSection.tsx`     | Modifier | Type `LivrePublique`                              |
| `app/(front)/livres/[slug]/_components/AutresTomes.tsx`     | Modifier | Type `LivrePublique`                              |
| `app/(front)/boutures/[slug]/_components/CoverPanel.tsx`    | Modifier | Type `BouturePublique`                            |
| `app/(front)/boutures/_components/BoutureBentoGrid.tsx`     | Modifier | Type `BouturePublique`                            |
| `app/(front)/boutures/_components/BoutureCard.tsx`          | Modifier | Type `BouturePublique`                            |
| `app/admin/(protected)/genres/page.tsx`                     | Créer    | Liste genres admin                                |
| `app/admin/(protected)/genres/nouveau/page.tsx`             | Créer    | Formulaire création                               |
| `app/admin/(protected)/genres/[id]/modifier/page.tsx`       | Créer    | Formulaire modification                           |
| `app/admin/(protected)/rayons/page.tsx`                     | Créer    | Liste rayons admin                                |
| `app/admin/(protected)/rayons/nouveau/page.tsx`             | Créer    | Formulaire création                               |
| `app/admin/(protected)/rayons/[id]/modifier/page.tsx`       | Créer    | Formulaire modification                           |
| `app/admin/(protected)/_components/AdminShell.tsx`          | Modifier | Ajouter Genres + Rayons dans nav                  |

---

## Task 1 : `lib/queries/livres.ts`

**Files:**

- Create: `lib/queries/livres.ts`

- [ ] **Créer le fichier avec toutes les queries publiques**

```ts
import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { livres, genres, rayons } from '@/db/schema';
import {
    eq,
    and,
    asc,
    desc,
    ilike,
    or,
    isNotNull,
    notInArray,
    ne,
    type SQL,
} from 'drizzle-orm';

export type SortLivres =
    | 'alpha'
    | 'prix-asc'
    | 'prix-desc'
    | 'note'
    | 'date'
    | 'editeur';

export interface LivresFilters {
    genre?: number;
    rayon?: number;
    serie?: string;
    editeur?: string;
    format?: string;
    sort?: SortLivres;
    q?: string;
    choixLibrairie?: boolean;
}

const livreSelect = {
    id: livres.id,
    slug: livres.slug,
    titre: livres.titre,
    auteur: livres.auteur,
    isbn: livres.isbn,
    genreId: livres.genreId,
    rayonId: livres.rayonId,
    editeur: livres.editeur,
    collection: livres.collection,
    format: livres.format,
    edition: livres.edition,
    anneePublication: livres.anneePublication,
    serie: livres.serie,
    numeroSerie: livres.numeroSerie,
    prix: livres.prix,
    description: livres.description,
    image: livres.image,
    noteMoyenne: livres.noteMoyenne,
    choixLibrairie: livres.choixLibrairie,
    stock: livres.stock,
    noteDeLaLibrairie: livres.noteDeLaLibrairie,
    publishedAt: livres.publishedAt,
} as const;

function buildOrderBy(sort?: SortLivres) {
    switch (sort) {
        case 'alpha':
            return asc(livres.titre);
        case 'prix-asc':
            return asc(livres.prix);
        case 'prix-desc':
            return desc(livres.prix);
        case 'note':
            return desc(livres.noteMoyenne);
        case 'date':
            return desc(livres.publishedAt);
        case 'editeur':
            return asc(livres.editeur);
        default:
            return asc(livres.titre);
    }
}

export const getLivresPubliques = unstable_cache(
    async (filters: LivresFilters = {}) => {
        const conditions: SQL[] = [];
        if (filters.rayon) conditions.push(eq(livres.rayonId, filters.rayon));
        if (filters.genre) conditions.push(eq(livres.genreId, filters.genre));
        if (filters.serie) conditions.push(eq(livres.serie, filters.serie));
        if (filters.editeur)
            conditions.push(eq(livres.editeur, filters.editeur));
        if (filters.format) conditions.push(eq(livres.format, filters.format));
        if (filters.choixLibrairie)
            conditions.push(eq(livres.choixLibrairie, true));
        if (filters.q) {
            const q = `%${filters.q}%`;
            conditions.push(
                or(
                    ilike(livres.titre, q),
                    ilike(livres.auteur, q),
                    ilike(livres.collection, q),
                    ilike(livres.editeur, q),
                    ilike(livres.serie, q),
                )!,
            );
        }
        const query = db
            .select(livreSelect)
            .from(livres)
            .orderBy(buildOrderBy(filters.sort));
        return conditions.length > 0 ? query.where(and(...conditions)) : query;
    },
    ['livres-publiques'],
    { tags: ['livres'] },
);

export type LivrePublique = Awaited<
    ReturnType<typeof getLivresPubliques>
>[number];

export const getLivreBySlug = unstable_cache(
    async (slug: string) =>
        db
            .select(livreSelect)
            .from(livres)
            .where(eq(livres.slug, slug))
            .limit(1)
            .then((r) => r[0] ?? null),
    ['livre-by-slug'],
    { tags: ['livres'] },
);

export const getLivresMisEnAvant = unstable_cache(
    async () =>
        db
            .select(livreSelect)
            .from(livres)
            .where(eq(livres.choixLibrairie, true))
            .orderBy(asc(livres.titre)),
    ['livres-mis-en-avant'],
    { tags: ['livres'] },
);

export const getLivresRayons = unstable_cache(
    async () =>
        db
            .selectDistinct({
                id: rayons.id,
                nom: rayons.nom,
                slug: rayons.slug,
            })
            .from(rayons)
            .innerJoin(livres, eq(livres.rayonId, rayons.id))
            .orderBy(rayons.nom),
    ['livres-rayons'],
    { tags: ['livres'] },
);

export const getGenresActifs = unstable_cache(
    async (rayonId?: number) => {
        const q = db
            .selectDistinct({
                id: genres.id,
                nom: genres.nom,
                slug: genres.slug,
            })
            .from(genres)
            .innerJoin(livres, eq(livres.genreId, genres.id));
        return rayonId
            ? q.where(eq(livres.rayonId, rayonId)).orderBy(genres.nom)
            : q.orderBy(genres.nom);
    },
    ['genres-actifs'],
    { tags: ['livres'] },
);

export const getLivresSeries = unstable_cache(
    async () => {
        const rows = await db
            .selectDistinct({ serie: livres.serie })
            .from(livres)
            .where(isNotNull(livres.serie))
            .orderBy(livres.serie);
        return rows.map((row) => row.serie as string);
    },
    ['livres-series'],
    { tags: ['livres'] },
);

export const getLivresEditeurs = unstable_cache(
    async () => {
        const rows = await db
            .selectDistinct({ editeur: livres.editeur })
            .from(livres)
            .where(isNotNull(livres.editeur))
            .orderBy(livres.editeur);
        return rows.map((row) => row.editeur as string);
    },
    ['livres-editeurs'],
    { tags: ['livres'] },
);

export const getLivresFormats = unstable_cache(
    async () => {
        const rows = await db
            .selectDistinct({ format: livres.format })
            .from(livres)
            .where(isNotNull(livres.format))
            .orderBy(livres.format);
        return rows.map((row) => row.format as string);
    },
    ['livres-formats'],
    { tags: ['livres'] },
);

export const getGenreById = unstable_cache(
    async (id: number) =>
        db
            .select()
            .from(genres)
            .where(eq(genres.id, id))
            .limit(1)
            .then((r) => r[0] ?? null),
    ['genre-by-id'],
    { tags: ['genres'] },
);

export const getRayonById = unstable_cache(
    async (id: number) =>
        db
            .select()
            .from(rayons)
            .where(eq(rayons.id, id))
            .limit(1)
            .then((r) => r[0] ?? null),
    ['rayon-by-id'],
    { tags: ['rayons'] },
);

export type GenrePublique = Awaited<ReturnType<typeof getGenreById>>;
export type RayonPublique = Awaited<ReturnType<typeof getRayonById>>;

export type Recommendations = {
    memeSerie: LivrePublique[];
    memeGenre: LivrePublique[];
    memeAuteur: LivrePublique[];
};

export const getRecommendations = unstable_cache(
    async (
        livreId: number,
        serie: string | null,
        genreId: number | null,
        auteur: string,
        limit = 4,
    ): Promise<Recommendations> => {
        const memeSerie = serie
            ? await db
                  .select(livreSelect)
                  .from(livres)
                  .where(and(eq(livres.serie, serie), ne(livres.id, livreId)))
                  .orderBy(asc(livres.numeroSerie))
            : [];

        const excludeForGenre = memeSerie.map((l) => l.id);
        const genreConditions: SQL[] = [ne(livres.id, livreId)];
        if (genreId) genreConditions.push(eq(livres.genreId, genreId));
        if (excludeForGenre.length > 0)
            genreConditions.push(notInArray(livres.id, excludeForGenre));

        const memeGenre = genreId
            ? await db
                  .select(livreSelect)
                  .from(livres)
                  .where(and(...genreConditions))
                  .orderBy(desc(livres.noteMoyenne))
                  .limit(limit)
            : [];

        const excludeForAuteur = [
            ...memeSerie.map((l) => l.id),
            ...memeGenre.map((l) => l.id),
        ];
        const auteurConditions: SQL[] = [
            eq(livres.auteur, auteur),
            ne(livres.id, livreId),
        ];
        if (excludeForAuteur.length > 0)
            auteurConditions.push(notInArray(livres.id, excludeForAuteur));

        const memeAuteur = await db
            .select(livreSelect)
            .from(livres)
            .where(and(...auteurConditions))
            .orderBy(desc(livres.noteMoyenne))
            .limit(limit);

        return { memeSerie, memeGenre, memeAuteur };
    },
    ['livres-recos'],
    { tags: ['livres'] },
);
```

- [ ] **Vérifier** : `npx tsc --noEmit` — aucune erreur sur ce fichier.

- [ ] **Commit**

```bash
git add lib/queries/livres.ts
git commit -m "feat: add public livre queries (DB)"
```

---

## Task 2 : `lib/queries/boutures.ts`

**Files:**

- Create: `lib/queries/boutures.ts`

- [ ] **Créer le fichier**

```ts
import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { plantes } from '@/db/schema';
import { eq, and, asc, desc, ilike, or, type SQL, sql } from 'drizzle-orm';

export type SortBoutures =
    | 'alpha'
    | 'prix-asc'
    | 'prix-desc'
    | 'note'
    | 'difficulte';

export interface BouturesFilters {
    difficulte?: string;
    lumiere?: string;
    arrosage?: string;
    sort?: SortBoutures;
    q?: string;
    choixLibrairie?: boolean;
}

const boutureSelect = {
    id: plantes.id,
    slug: plantes.slug,
    nom: plantes.nom,
    espece: plantes.espece,
    famille: plantes.famille,
    prix: plantes.prix,
    description: plantes.description,
    conseilsEntretien: plantes.conseilsEntretien,
    difficulte: plantes.difficulte,
    lumiere: plantes.lumiere,
    arrosage: plantes.arrosage,
    image: plantes.image,
    noteMoyenne: plantes.noteMoyenne,
    choixLibrairie: plantes.choixLibrairie,
    stock: plantes.stock,
    noteDeLaLibrairie: plantes.noteDeLaLibrairie,
} as const;

function buildBoutureOrderBy(sort?: SortBoutures) {
    switch (sort) {
        case 'alpha':
            return asc(plantes.nom);
        case 'prix-asc':
            return asc(plantes.prix);
        case 'prix-desc':
            return desc(plantes.prix);
        case 'note':
            return desc(plantes.noteMoyenne);
        case 'difficulte':
            return sql`CASE ${plantes.difficulte} WHEN 'facile' THEN 0 WHEN 'moyen' THEN 1 WHEN 'difficile' THEN 2 ELSE 3 END`;
        default:
            return asc(plantes.nom);
    }
}

export const getBouturesPubliques = unstable_cache(
    async (filters: BouturesFilters = {}) => {
        const conditions: SQL[] = [];
        if (filters.difficulte)
            conditions.push(
                eq(
                    plantes.difficulte,
                    filters.difficulte as 'facile' | 'moyen' | 'difficile',
                ),
            );
        if (filters.lumiere)
            conditions.push(
                eq(
                    plantes.lumiere,
                    filters.lumiere as
                        | 'ombre'
                        | 'mi-ombre'
                        | 'lumiere-vive'
                        | 'plein-soleil',
                ),
            );
        if (filters.arrosage)
            conditions.push(
                eq(
                    plantes.arrosage,
                    filters.arrosage as
                        | 'rare'
                        | 'modere'
                        | 'regulier'
                        | 'abondant',
                ),
            );
        if (filters.choixLibrairie)
            conditions.push(eq(plantes.choixLibrairie, true));
        if (filters.q) {
            const q = `%${filters.q}%`;
            conditions.push(
                or(
                    ilike(plantes.nom, q),
                    ilike(plantes.espece, q),
                    ilike(plantes.famille, q),
                )!,
            );
        }
        const query = db
            .select(boutureSelect)
            .from(plantes)
            .orderBy(buildBoutureOrderBy(filters.sort));
        return conditions.length > 0 ? query.where(and(...conditions)) : query;
    },
    ['boutures-publiques'],
    { tags: ['boutures'] },
);

export type BouturePublique = Awaited<
    ReturnType<typeof getBouturesPubliques>
>[number];

export const getBoutureBySlug = unstable_cache(
    async (slug: string) =>
        db
            .select(boutureSelect)
            .from(plantes)
            .where(eq(plantes.slug, slug))
            .limit(1)
            .then((r) => r[0] ?? null),
    ['bouture-by-slug'],
    { tags: ['boutures'] },
);
```

- [ ] **Vérifier** : `npx tsc --noEmit` — aucune erreur.

- [ ] **Commit**

```bash
git add lib/queries/boutures.ts
git commit -m "feat: add public bouture queries (DB)"
```

---

## Task 3 : `revalidateTag` dans les actions admin

Les mutations admin doivent invalider le cache public quand elles modifient livres ou plantes.

**Files:**

- Modify: `lib/actions/livres.ts`
- Modify: `lib/actions/plantes.ts`

- [ ] **Dans `lib/actions/livres.ts`** — ajouter l'import `revalidateTag` et l'appeler dans chaque mutation :

Ligne 3, remplacer :

```ts
import { revalidatePath } from 'next/cache';
```

par :

```ts
import { revalidatePath, revalidateTag } from 'next/cache';
```

Dans `createLivre`, après `revalidatePath('/admin/livres')` :

```ts
revalidateTag('livres');
```

Dans `updateLivre`, après `revalidatePath('/admin/livres')` :

```ts
revalidateTag('livres');
```

Dans `deleteLivre`, après `revalidatePath('/admin/livres')` :

```ts
revalidateTag('livres');
```

Dans `updateStock`, après `revalidatePath('/admin/livres')` :

```ts
revalidateTag('livres');
```

- [ ] **Dans `lib/actions/plantes.ts`** — même pattern :

Ajouter `revalidateTag` à l'import :

```ts
import { revalidatePath, revalidateTag } from 'next/cache';
```

Dans `createPlante`, `updatePlante`, `deletePlante`, `updateStock` — après chaque `revalidatePath('/admin/boutures')` :

```ts
revalidateTag('boutures');
```

- [ ] **Vérifier** : `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/actions/livres.ts lib/actions/plantes.ts
git commit -m "feat: revalidate public cache on admin mutations"
```

---

## Task 4 : Wire `/livres` page

**Files:**

- Modify: `app/(front)/livres/page.tsx`

- [ ] **Remplacer le contenu complet** :

```tsx
import type { Metadata } from 'next';
import {
    getLivresPubliques,
    getLivresMisEnAvant,
    getGenresActifs,
    getLivresRayons,
    getLivresSeries,
    getLivresEditeurs,
    getLivresFormats,
    type SortLivres,
} from '@/lib/queries/livres';
import { FilterBar } from './_components/FilterBar';
import { SearchBar } from './_components/SearchBar';
import { LivreCard } from '@/components/ui/LivreCard';
import { VusRecemment } from '@/components/ui/VusRecemment';

export const metadata: Metadata = {
    title: 'Livres',
    description: 'Parcourez notre sélection de livres soignés.',
};

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LivresPage({ searchParams }: Props) {
    const params = await searchParams;

    const rayonId = params.rayon ? Number(params.rayon) : undefined;
    const genreId = params.genre ? Number(params.genre) : undefined;
    const serie = params.serie ?? undefined;
    const editeur = params.editeur ?? undefined;
    const format = params.format ?? undefined;
    const sort = (params.sort as SortLivres) ?? undefined;
    const q = params.q ?? undefined;
    const choixLibrairie = params.choix === '1' ? true : undefined;

    const isFiltered = !!(
        q ||
        rayonId ||
        genreId ||
        serie ||
        editeur ||
        format ||
        choixLibrairie
    );

    const [
        livresList,
        misEnAvant,
        rayons,
        genresList,
        series,
        editeurs,
        formats,
    ] = await Promise.all([
        getLivresPubliques({
            rayon: rayonId,
            genre: genreId,
            serie,
            editeur,
            format,
            sort,
            q,
            choixLibrairie,
        }),
        isFiltered ? Promise.resolve([]) : getLivresMisEnAvant(),
        getLivresRayons(),
        getGenresActifs(rayonId),
        getLivresSeries(),
        getLivresEditeurs(),
        getLivresFormats(),
    ]);

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">
                Livres
            </h1>

            <VusRecemment />

            <SearchBar value={q ?? ''} />

            <FilterBar
                rayons={rayons}
                genres={genresList}
                series={series}
                editeurs={editeurs}
                formats={formats}
                activeRayonId={rayonId}
                activeGenreId={genreId}
                activeSerie={serie}
                activeEditeur={editeur}
                activeFormat={format}
                activeSort={sort}
                activeChoixLibrairie={!!choixLibrairie}
            />

            {isFiltered ? (
                <div className="space-y-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted">
                        {livresList.length} titre
                        {livresList.length !== 1 ? 's' : ''}
                        {q && (
                            <>
                                {' '}
                                pour{' '}
                                <em className="not-italic font-medium text-foreground">
                                    &#34;{q}&#34;
                                </em>
                            </>
                        )}
                    </p>
                    {livresList.length === 0 ? (
                        <p className="text-sm text-muted">Aucun résultat.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {livresList.map((livre) => (
                                <LivreCard key={livre.id} livre={livre} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-14">
                    {misEnAvant.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-baseline gap-4">
                                <h2 className="font-serif text-xl font-bold text-foreground">
                                    Choix de la librairie
                                </h2>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {misEnAvant.map((livre) => (
                                    <LivreCard
                                        key={livre.id}
                                        livre={livre}
                                        featured
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                    <section className="space-y-6">
                        <div className="flex items-baseline gap-4">
                            <h2 className="font-serif text-xl font-bold text-foreground">
                                Tout le catalogue
                            </h2>
                            <span className="text-xs uppercase tracking-widest text-muted">
                                {livresList.length} titre
                                {livresList.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {livresList.map((livre) => (
                                <LivreCard key={livre.id} livre={livre} />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Mettre à jour les types dans les composants FilterBar** — `app/(front)/livres/_components/FilterBar.tsx` : remplacer l'import `type { Genre, Rayon, SortLivres } from '@/lib/data'` par `import type { SortLivres } from '@/lib/queries/livres'` et définir les types inline ou importer `GenrePublique`, `RayonPublique` depuis `@/lib/queries/livres`.

Dans `FilterBar.tsx`, changer :

```ts
import type { Genre, Rayon, SortLivres } from '@/lib/data';
```

en :

```ts
import type {
    GenrePublique,
    RayonPublique,
    SortLivres,
} from '@/lib/queries/livres';
```

Et remplacer `Genre` → `GenrePublique`, `Rayon` → `RayonPublique` dans les props et types locaux.

Faire la même chose dans :

- `app/(front)/livres/_components/GenreFilter.tsx` : `type { Genre }` → `type { GenrePublique }`
- `app/(front)/livres/_components/RayonFilter.tsx` : `type { Rayon }` → `type { RayonPublique }`
- `app/(front)/livres/_components/LivresActiveFilters.tsx` : `type { Genre, Rayon }` → `type { GenrePublique, RayonPublique }`
- `app/(front)/livres/_components/LivresDropdownFilters.tsx` : `type { SortLivres }` → `from '@/lib/queries/livres'`

- [ ] **Mettre à jour `LivreCard`** — `components/ui/LivreCard.tsx` : remplacer `import type { Livre } from '@/lib/data'` par `import type { LivrePublique } from '@/lib/queries/livres'` et `Livre` → `LivrePublique` dans le type de prop.

- [ ] **Mettre à jour `LivresSection`** — `app/(front)/_components/LivresSection.tsx` : remplacer `import type { Livre } from '@/lib/data'` par `import type { LivrePublique } from '@/lib/queries/livres'` et `Livre` → `LivrePublique`.

- [ ] **Vérifier** : `npx tsc --noEmit`

- [ ] **Test** : `npm run dev` → naviguer sur `/livres` — les livres DB s'affichent, les filtres fonctionnent.

- [ ] **Commit**

```bash
git add "app/(front)/livres/page.tsx" "app/(front)/livres/_components/" "app/(front)/_components/LivresSection.tsx" components/ui/LivreCard.tsx
git commit -m "feat: wire /livres page to DB"
```

---

## Task 5 : Wire `/livres/[slug]` + opengraph-image

**Files:**

- Modify: `app/(front)/livres/[slug]/page.tsx`
- Modify: `app/(front)/livres/[slug]/opengraph-image.tsx`
- Modify: `app/(front)/livres/[slug]/_components/CoverPanel.tsx`
- Modify: `app/(front)/livres/[slug]/_components/LivreBreadcrumb.tsx`
- Modify: `app/(front)/livres/[slug]/_components/LivreHeader.tsx`
- Modify: `app/(front)/livres/[slug]/_components/RecoSection.tsx`
- Modify: `app/(front)/livres/[slug]/_components/AutresTomes.tsx`
- Modify: `app/(front)/livres/[slug]/_components/NoteLibrairie.tsx`

- [ ] **Remplacer `app/(front)/livres/[slug]/page.tsx`** :

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getLivreBySlug,
    getLivresPubliques,
    getGenreById,
    getRayonById,
    getRecommendations,
    getCoverColor,
} from '@/lib/queries/livres';
import { getCoverColor } from '@/lib/data';
import { getAvisForLivre } from '@/lib/db/avis';
import { CoverPanel } from './_components/CoverPanel';
import { NoteLibrairie } from './_components/NoteLibrairie';
import { RecoSection } from './_components/RecoSection';
import { LivreBreadcrumb } from './_components/LivreBreadcrumb';
import { LivreHeader } from './_components/LivreHeader';
import { AutresTomes } from './_components/AutresTomes';
import { AvisSection } from '@/components/ui/AvisSection';
import { VisitTracker } from '@/components/ui/VisitTracker';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const livre = await getLivreBySlug(slug);
    if (!livre) return {};
    return { title: livre.titre, description: livre.description ?? undefined };
}

export async function generateStaticParams() {
    const all = await getLivresPubliques();
    return all.map((livre) => ({ slug: livre.slug }));
}

export default async function LivrePage({ params }: Props) {
    const { slug } = await params;
    const livre = await getLivreBySlug(slug);
    if (!livre) notFound();

    const [genre, rayon, avis, reco] = await Promise.all([
        livre.genreId ? getGenreById(livre.genreId) : Promise.resolve(null),
        livre.rayonId ? getRayonById(livre.rayonId) : Promise.resolve(null),
        getAvisForLivre(livre.id),
        getRecommendations(
            livre.id,
            livre.serie ?? null,
            livre.genreId ?? null,
            livre.auteur,
        ),
    ]);

    const coverColor = getCoverColor(livre.genreId);

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <VisitTracker
                type="livre"
                slug={livre.slug}
                titre={livre.titre}
                auteur={livre.auteur}
                coverColor={coverColor}
                image={livre.image ?? undefined}
            />
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16">
                <CoverPanel
                    livre={livre}
                    coverColor={coverColor}
                    rayon={rayon}
                />
                <div className="space-y-10">
                    <LivreBreadcrumb
                        livre={livre}
                        genre={genre}
                        rayon={rayon}
                    />
                    <LivreHeader livre={livre} />
                    {livre.description && (
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Description
                            </h2>
                            <p className="text-base text-foreground leading-relaxed max-w-[68ch]">
                                {livre.description}
                            </p>
                        </div>
                    )}
                    {livre.noteDeLaLibrairie && (
                        <NoteLibrairie note={livre.noteDeLaLibrairie} />
                    )}
                    {livre.serie && reco.memeSerie.length > 0 && (
                        <AutresTomes
                            serie={livre.serie}
                            tomes={reco.memeSerie}
                        />
                    )}
                    {reco.memeGenre.length > 0 && genre && (
                        <RecoSection
                            prefix="Dans le même genre"
                            label={genre.nom}
                            href={`/livres?genre=${livre.genreId}`}
                            livres={reco.memeGenre}
                        />
                    )}
                    {reco.memeAuteur.length > 0 && (
                        <RecoSection
                            prefix="Par"
                            label={livre.auteur}
                            href={`/livres?q=${encodeURIComponent(livre.auteur)}`}
                            livres={reco.memeAuteur}
                        />
                    )}
                    <AvisSection avis={avis} itemId={livre.id} type="livre" />
                </div>
            </div>
        </div>
    );
}
```

**Note importante :** l'import `getCoverColor` vient de `'@/lib/data'` (helper pur, pas une query DB — reste dans lib/data.ts). Corriger l'import dupliqué ci-dessus :

```tsx
import {
    getLivreBySlug,
    getLivresPubliques,
    getGenreById,
    getRayonById,
    getRecommendations,
} from '@/lib/queries/livres';
import { getCoverColor } from '@/lib/data';
```

- [ ] **Mettre à jour les types dans les `_components/`** :

Dans `CoverPanel.tsx` : `import type { Livre, Rayon }` → `import type { LivrePublique, RayonPublique } from '@/lib/queries/livres'` + renommer les types dans les props.

Dans `LivreBreadcrumb.tsx` : `import type { Genre, Rayon }` → `import type { GenrePublique, RayonPublique } from '@/lib/queries/livres'`.

Dans `LivreHeader.tsx` : si import `Livre` → `LivrePublique`.

Dans `RecoSection.tsx` : `import { getCoverColor }` reste `from '@/lib/data'`. Si import `Livre` → `LivrePublique from '@/lib/queries/livres'`.

Dans `AutresTomes.tsx` : `import { getCoverColor }` reste `from '@/lib/data'`. Si import `Livre` → `LivrePublique`.

Dans `NoteLibrairie.tsx` : pas de changement de type si la prop est juste une `string`.

- [ ] **Remplacer `opengraph-image.tsx`** :

```tsx
import { ImageResponse } from 'next/og';
import {
    getLivreBySlug,
    getLivresPubliques,
    getGenreById,
} from '@/lib/queries/livres';
import { getCoverColor } from '@/lib/data';
import { loadOgFonts } from '@/lib/og-fonts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
    const all = await getLivresPubliques();
    return all.map((livre) => ({ slug: livre.slug }));
}

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const [livre, fonts] = await Promise.all([
        getLivreBySlug(slug),
        loadOgFonts(),
    ]);

    if (!livre) {
        return new ImageResponse(
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#2d4b3e',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <span
                    style={{
                        color: '#f5f4ef',
                        fontFamily: 'Noto Serif',
                        fontSize: 32,
                    }}
                >
                    Lecture &amp; Boutures
                </span>
            </div>,
            { ...size, fonts },
        );
    }

    const genre = livre.genreId ? await getGenreById(livre.genreId) : null;
    const coverColor = getCoverColor(livre.genreId);

    return new ImageResponse(
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div
                style={{
                    width: '360px',
                    height: '100%',
                    backgroundColor: coverColor,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '44px',
                }}
            >
                <p
                    style={{
                        color: '#2d4b3e',
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0',
                    }}
                >
                    Lecture &amp; Boutures
                </p>
            </div>
            <div
                style={{
                    flex: 1,
                    backgroundColor: '#f5f4ef',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '64px 64px 64px 56px',
                }}
            >
                {genre && (
                    <p
                        style={{
                            color: '#8a9e95',
                            fontSize: 13,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            fontFamily: 'Noto Serif',
                            fontWeight: 400,
                            margin: '0 0 28px 0',
                        }}
                    >
                        {genre.nom}
                    </p>
                )}
                <h1
                    style={{
                        color: '#1a1a1a',
                        fontSize: livre.titre.length > 40 ? 42 : 54,
                        fontWeight: 700,
                        fontFamily: 'Noto Serif',
                        lineHeight: 1.15,
                        margin: '0 0 24px 0',
                    }}
                >
                    {livre.titre}
                </h1>
                <p
                    style={{
                        color: '#8a9e95',
                        fontSize: 22,
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0',
                    }}
                >
                    {livre.auteur}
                </p>
            </div>
        </div>,
        { ...size, fonts },
    );
}
```

- [ ] **Vérifier** : `npx tsc --noEmit`

- [ ] **Test** : `npm run dev` → naviguer sur `/livres/[slug-existant]` — fiche s'affiche avec données DB, recos présentes.

- [ ] **Commit**

```bash
git add "app/(front)/livres/[slug]/"
git commit -m "feat: wire /livres/[slug] to DB"
```

---

## Task 6 : Wire `/boutures` page

**Files:**

- Modify: `app/(front)/boutures/page.tsx`
- Modify: `app/(front)/boutures/_components/BoutureBentoGrid.tsx`
- Modify: `app/(front)/boutures/_components/BoutureCard.tsx`
- Modify: `app/(front)/boutures/_components/BouturesFilterBar.tsx` (si présent)
- Modify: `app/(front)/boutures/_components/BoutureDifficulteFilter.tsx`
- Modify: `app/(front)/boutures/_components/BouturesActiveFilters.tsx`
- Modify: `app/(front)/boutures/_components/BouturesDropdownFilters.tsx`

- [ ] **Remplacer `app/(front)/boutures/page.tsx`** :

```tsx
import type { Metadata } from 'next';
import {
    getBouturesPubliques,
    type BouturesFilters,
    type SortBoutures,
} from '@/lib/queries/boutures';
import { BoutureIntro } from './_components/BoutureIntro';
import { BoutureBentoGrid } from './_components/BoutureBentoGrid';
import { BouturesFilterBar } from './_components/BouturesFilterBar';
import { BouturesSearchBar } from './_components/BouturesSearchBar';

export const metadata: Metadata = {
    title: 'Boutures',
    description:
        'Spécimens végétaux soignés — une sélection de boutures rares et de caractère.',
};

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

export default async function BouturesPage({ searchParams }: Props) {
    const params = await searchParams;

    const difficulte = params.difficulte ?? undefined;
    const lumiere = params.lumiere ?? undefined;
    const arrosage = params.arrosage ?? undefined;
    const sort = (params.sort as SortBoutures) ?? undefined;
    const q = params.q ?? undefined;

    const boutures = await getBouturesPubliques({
        difficulte,
        lumiere,
        arrosage,
        sort,
        q,
    });

    return (
        <div className="max-w-6xl mx-auto px-6 py-section space-y-section">
            <header className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Spécimens végétaux
                </p>
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                    Boutures
                </h1>
                <p className="text-base text-muted leading-[1.75] max-w-[52ch]">
                    Une sélection de spécimens choisis pour leur caractère et
                    leur rareté. Chaque bouture est présentée avec ses besoins
                    et son histoire.
                </p>
            </header>

            <BoutureIntro />
            <BoutureBentoGrid boutures={boutures} />
        </div>
    );
}
```

**Note :** Si la page boutures n'a pas de filterbar dans le PRD, retirer les imports `BouturesFilterBar`/`BouturesSearchBar` et passer `getBouturesPubliques()` sans filtres. Garder les searchParams si les composants de filtre sont utilisés.

- [ ] **Mettre à jour les types dans `_components/`** :

Dans `BoutureBentoGrid.tsx` : remplacer `import type { Bouture } from '@/lib/data'` par `import type { BouturePublique } from '@/lib/queries/boutures'` + renommer.

Dans `BoutureCard.tsx` : même changement `Bouture` → `BouturePublique`.

Dans `BoutureDifficulteFilter.tsx` : `import { DIFFICULTE_LABELS }` reste `from '@/lib/data'` (constante pure).

Dans `BouturesActiveFilters.tsx` : `import { DIFFICULTE_LABELS, LUMIERE_LABELS, ARROSAGE_LABELS }` reste `from '@/lib/data'`. Changer `type { SortBoutures }` → `from '@/lib/queries/boutures'`.

Dans `BouturesDropdownFilters.tsx` : `import { LUMIERE_LABELS, ARROSAGE_LABELS, type SortBoutures }` — garder labels `from '@/lib/data'`, type `SortBoutures` `from '@/lib/queries/boutures'`.

Dans `BouturesFilterBar.tsx` : `import type { SortBoutures }` → `from '@/lib/queries/boutures'`.

- [ ] **Vérifier** : `npx tsc --noEmit`

- [ ] **Test** : `npm run dev` → naviguer sur `/boutures` — les boutures DB s'affichent.

- [ ] **Commit**

```bash
git add "app/(front)/boutures/page.tsx" "app/(front)/boutures/_components/"
git commit -m "feat: wire /boutures page to DB"
```

---

## Task 7 : Wire `/boutures/[slug]` + opengraph-image

**Files:**

- Modify: `app/(front)/boutures/[slug]/page.tsx`
- Modify: `app/(front)/boutures/[slug]/opengraph-image.tsx`
- Modify: `app/(front)/boutures/[slug]/_components/CoverPanel.tsx`

**Attention :** La page actuelle utilise `bouture.images?.[0]` (tableau — format JSON). La DB stocke `bouture.image` (string unique). Il faut corriger tous les accès.

- [ ] **Remplacer `app/(front)/boutures/[slug]/page.tsx`** :

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBoutureBySlug, getBouturesPubliques } from '@/lib/queries/boutures';
import { getBoutureCoverColor, DIFFICULTE_LABELS } from '@/lib/data';
import { getAvisForBouture } from '@/lib/db/avis';
import { CoverPanel } from './_components/CoverPanel';
import { Stars } from '@/components/ui/Stars';
import { AvisSection } from '@/components/ui/AvisSection';
import { VisitTracker } from '@/components/ui/VisitTracker';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const bouture = await getBoutureBySlug(slug);
    if (!bouture) return {};
    return {
        title: bouture.nom,
        description: bouture.description ?? undefined,
    };
}

export async function generateStaticParams() {
    const all = await getBouturesPubliques();
    return all.map((bouture) => ({ slug: bouture.slug }));
}

export default async function BouturePage({ params }: Props) {
    const { slug } = await params;
    const [bouture] = await Promise.all([getBoutureBySlug(slug)]);
    if (!bouture) notFound();

    const [avis] = await Promise.all([getAvisForBouture(bouture.id)]);
    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const noteMoyenne = bouture.noteMoyenne
        ? parseFloat(bouture.noteMoyenne)
        : null;

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <VisitTracker
                type="bouture"
                slug={bouture.slug}
                titre={bouture.nom}
                coverColor={coverColor}
                image={bouture.image ?? undefined}
            />
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16">
                <CoverPanel bouture={bouture} coverColor={coverColor} />
                <div className="space-y-10">
                    <nav className="flex items-center gap-2 text-xs text-muted">
                        <Link
                            href="/boutures"
                            className="hover:text-primary transition-colors"
                        >
                            Boutures
                        </Link>
                        <span>·</span>
                        <Link
                            href={`/boutures?difficulte=${bouture.difficulte}`}
                            className="hover:text-primary transition-colors"
                        >
                            {DIFFICULTE_LABELS[bouture.difficulte ?? ''] ??
                                bouture.difficulte}
                        </Link>
                    </nav>
                    <div className="space-y-2">
                        <h1 className="font-serif text-4xl font-bold text-foreground leading-tight tracking-tight">
                            {bouture.nom}
                        </h1>
                        <p className="text-lg text-muted italic">
                            {bouture.espece}
                        </p>
                        {noteMoyenne && (
                            <div className="flex items-center gap-2 pt-1">
                                <Stars note={noteMoyenne} />
                                <span className="text-xs text-muted">
                                    {noteMoyenne.toFixed(1)} / 5
                                </span>
                            </div>
                        )}
                        {bouture.choixLibrairie && (
                            <span className="inline-block bg-background border border-border px-2 py-1 text-[7px] font-medium uppercase tracking-[0.12em] text-primary leading-tight mt-1">
                                Choix de la librairie
                            </span>
                        )}
                    </div>
                    {bouture.description && (
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Description
                            </h2>
                            <p className="text-base text-foreground leading-relaxed max-w-[68ch]">
                                {bouture.description}
                            </p>
                        </div>
                    )}
                    {bouture.conseilsEntretien && (
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Entretien
                            </h2>
                            <p className="text-base text-foreground leading-relaxed max-w-[68ch]">
                                {bouture.conseilsEntretien}
                            </p>
                        </div>
                    )}
                    <AvisSection
                        avis={avis}
                        itemId={bouture.id}
                        type="bouture"
                    />
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Mettre à jour `CoverPanel.tsx`** dans `boutures/[slug]/_components/` : remplacer `import type { Bouture }` par `import type { BouturePublique } from '@/lib/queries/boutures'`. Corriger `bouture.images?.[0]` → `bouture.image` si présent dans ce composant.

- [ ] **Remplacer `opengraph-image.tsx`** :

```tsx
import { ImageResponse } from 'next/og';
import { getBoutureBySlug, getBouturesPubliques } from '@/lib/queries/boutures';
import { getBoutureCoverColor } from '@/lib/data';
import { loadOgFonts } from '@/lib/og-fonts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
    const all = await getBouturesPubliques();
    return all.map((bouture) => ({ slug: bouture.slug }));
}

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const [bouture, fonts] = await Promise.all([
        getBoutureBySlug(slug),
        loadOgFonts(),
    ]);

    if (!bouture) {
        return new ImageResponse(
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#2d4b3e',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <span
                    style={{
                        color: '#f5f4ef',
                        fontFamily: 'Noto Serif',
                        fontSize: 32,
                    }}
                >
                    Lecture &amp; Boutures
                </span>
            </div>,
            { ...size, fonts },
        );
    }

    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const prix = bouture.prix
        ? `${parseFloat(bouture.prix).toFixed(2).replace('.', ',')} €`
        : null;

    return new ImageResponse(
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div
                style={{
                    width: '360px',
                    height: '100%',
                    backgroundColor: '#2d4b3e',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '44px',
                }}
            >
                <p
                    style={{
                        color: '#8a9e95',
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0',
                    }}
                >
                    Lecture &amp; Boutures
                </p>
            </div>
            <div
                style={{
                    flex: 1,
                    backgroundColor: coverColor,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '64px 64px 64px 56px',
                }}
            >
                <p
                    style={{
                        color: '#2d4b3e',
                        fontSize: 13,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0 0 28px 0',
                    }}
                >
                    Bouture
                </p>
                <h1
                    style={{
                        color: '#1a1a1a',
                        fontSize: bouture.nom.length > 30 ? 46 : 58,
                        fontWeight: 700,
                        fontFamily: 'Noto Serif',
                        lineHeight: 1.15,
                        margin: '0 0 20px 0',
                    }}
                >
                    {bouture.nom}
                </h1>
                <p
                    style={{
                        color: '#3d6354',
                        fontSize: 20,
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        margin: prix ? '0 0 28px 0' : '0',
                    }}
                >
                    {bouture.espece}
                </p>
                {prix && (
                    <p
                        style={{
                            color: '#1a1a1a',
                            fontSize: 26,
                            fontFamily: 'Noto Serif',
                            fontWeight: 700,
                            margin: '0',
                        }}
                    >
                        {prix}
                    </p>
                )}
            </div>
        </div>,
        { ...size, fonts },
    );
}
```

- [ ] **Vérifier** : `npx tsc --noEmit`

- [ ] **Test** : `npm run dev` → naviguer sur `/boutures/[slug-existant]` — fiche s'affiche avec données DB.

- [ ] **Commit**

```bash
git add "app/(front)/boutures/[slug]/"
git commit -m "feat: wire /boutures/[slug] to DB"
```

---

## Task 8 : Wire `/` home + `/surprendre` + `sitemap.ts`

**Files:**

- Modify: `app/(front)/page.tsx`
- Modify: `app/(front)/surprendre/page.tsx`
- Modify: `app/sitemap.ts`

- [ ] **Remplacer `app/(front)/page.tsx`** :

```tsx
import type { Metadata } from 'next';
import { siteConfig } from '@/lib/metadata';
import { getLivresPubliques } from '@/lib/queries/livres';
import { HeroSection } from './_components/HeroSection';
import { LivresSection } from './_components/LivresSection';
import { SurprendreSection } from './_components/SurprendreSection';

export const metadata: Metadata = { title: siteConfig.name };

const LIMIT = 8;

const SECTIONS = [
    {
        id: 'nouveautes',
        titre: 'Nouveautés',
        description: 'Les dernières arrivées dans nos rayons.',
        filters: { sort: 'date' as const },
        href: '/livres?sort=date',
    },
    {
        id: 'imaginaire',
        titre: 'Imaginaire',
        description: 'Science-fiction, fantasy, mondes à part entière.',
        filters: { rayon: 5 },
        href: '/livres?rayon=5',
    },
    {
        id: 'sciences-nature',
        titre: 'Sciences & Nature',
        description: 'Botanique, écologie, sciences du vivant.',
        filters: { rayon: 1 },
        href: '/livres?rayon=1',
    },
    {
        id: 'choix',
        titre: 'Choix de la librairie',
        description: 'Ce que notre équipe aime vraiment.',
        filters: { choixLibrairie: true as const },
        href: '/livres?choix=1',
    },
] as const;

export default async function HomePage() {
    const sections = await Promise.all(
        SECTIONS.map(async (section) => ({
            ...section,
            livres: (await getLivresPubliques(section.filters)).slice(0, LIMIT),
        })),
    );

    return (
        <>
            <HeroSection />
            {sections.map((section) => (
                <LivresSection
                    key={section.id}
                    titre={section.titre}
                    description={section.description}
                    livres={section.livres}
                    href={section.href}
                />
            ))}
            <SurprendreSection />
        </>
    );
}
```

- [ ] **Remplacer `app/(front)/surprendre/page.tsx`** :

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getLivresMisEnAvant, getGenreById } from '@/lib/queries/livres';
import { getCoverColor } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Me faire surprendre',
    description: 'Un livre choisi par notre équipe, rien que pour vous.',
};

export default async function SurprendrePage() {
    const candidats = await getLivresMisEnAvant();
    const livre = candidats[Math.floor(Math.random() * candidats.length)];

    if (!livre) {
        return (
            <div className="max-w-xl mx-auto px-6 py-32 text-center">
                <p className="text-sm text-muted">
                    Aucun choix de librairie disponible pour le moment.
                </p>
                <Link
                    href="/livres"
                    className="mt-8 inline-block text-[11px] uppercase tracking-[0.1em] font-medium text-primary hover:text-foreground transition-colors"
                >
                    Parcourir le catalogue &rarr;
                </Link>
            </div>
        );
    }

    const coverColor = getCoverColor(livre.genreId);
    const genre = livre.genreId ? await getGenreById(livre.genreId) : null;
    const coverImage = livre.image ?? null;
    const achatUrl = `https://www.leslibraires.fr/recherche/?q=${encodeURIComponent(livre.titre + ' ' + livre.auteur)}`;

    return (
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-16">
                Le choix de la libraire
            </p>
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12 lg:gap-20 items-start">
                <div
                    className="aspect-book w-full max-w-[220px] relative overflow-hidden"
                    style={{ backgroundColor: coverColor }}
                >
                    {coverImage && (
                        <Image
                            src={coverImage}
                            alt={livre.titre}
                            fill
                            className="object-cover"
                            sizes="220px"
                            priority
                        />
                    )}
                </div>
                <div className="space-y-8">
                    <div className="space-y-2">
                        {genre && (
                            <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                                {genre.nom}
                            </p>
                        )}
                        <h1 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-foreground leading-[1.1] tracking-[-0.02em]">
                            {livre.titre}
                        </h1>
                        <p className="text-lg text-muted">{livre.auteur}</p>
                        <p className="text-base font-medium text-primary pt-1">
                            {livre.prix} €
                        </p>
                    </div>
                    {livre.noteDeLaLibrairie && (
                        <div className="space-y-3 border-l border-border pl-6">
                            <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                                Pourquoi on aime ce livre
                            </p>
                            <p className="text-base text-foreground leading-[1.75] max-w-[60ch]">
                                {livre.noteDeLaLibrairie}
                            </p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <a
                            href={achatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-primary text-background px-8 py-3.5 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors duration-200 hover:bg-primary-light text-center"
                        >
                            Acheter chez leslibraires.fr
                        </a>
                        <Link
                            href="/surprendre"
                            className="inline-block border border-border text-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors duration-200 hover:border-primary hover:text-primary text-center"
                        >
                            Autre suggestion
                        </Link>
                    </div>
                    <p className="text-xs text-muted">
                        Ou{' '}
                        <Link
                            href={`/livres/${livre.slug}`}
                            className="underline underline-offset-4 hover:text-primary transition-colors"
                        >
                            voir la fiche complète
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
```

- [ ] **Remplacer `app/sitemap.ts`** :

```ts
import type { MetadataRoute } from 'next';
import { getLivresPubliques } from '@/lib/queries/livres';
import { getBouturesPubliques } from '@/lib/queries/boutures';
import { siteConfig } from '@/lib/metadata';

const base = siteConfig.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [livresList, bouturesList] = await Promise.all([
        getLivresPubliques(),
        getBouturesPubliques(),
    ]);
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: base,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${base}/livres`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${base}/boutures`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${base}/surprendre`,
            lastModified: now,
            changeFrequency: 'always',
            priority: 0.7,
        },
        {
            url: `${base}/concept`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${base}/contact`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
    ];

    return [
        ...staticRoutes,
        ...livresList.map((livre) => ({
            url: `${base}/livres/${livre.slug}`,
            lastModified: livre.publishedAt ?? now,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
        ...bouturesList.map((bouture) => ({
            url: `${base}/boutures/${bouture.slug}`,
            lastModified: now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        })),
    ];
}
```

- [ ] **Vérifier** : `npx tsc --noEmit`

- [ ] **Test** : `npm run dev` → vérifier `/`, `/surprendre`, `http://localhost:3000/sitemap.xml`.

- [ ] **Commit**

```bash
git add "app/(front)/page.tsx" "app/(front)/surprendre/page.tsx" app/sitemap.ts
git commit -m "feat: wire home, surprendre, sitemap to DB"
```

---

## Task 9 : Nettoyage `lib/data.ts`

Supprimer toutes les fonctions d'accès aux données (JSON). Garder uniquement les constantes et helpers purs.

**Files:**

- Modify: `lib/data.ts`

- [ ] **Vérifier qu'aucune fonction JSON n'est encore importée** :

```bash
grep -rn "from '@/lib/data'" app/ components/ lib/ --include="*.tsx" --include="*.ts"
```

Tout import doit être uniquement pour : `getCoverColor`, `getBoutureCoverColor`, `DIFFICULTE_LABELS`, `LUMIERE_LABELS`, `ARROSAGE_LABELS`. Si d'autres fonctions apparaissent, les fichiers correspondants ont été oubliés — les corriger d'abord.

- [ ] **Remplacer le contenu de `lib/data.ts`** par uniquement les constantes et helpers purs :

```ts
// Couleurs de couverture par genre (fallback quand pas d'image)
const GENRE_COLORS: Record<number, string> = {
    1: '#c2c8cc',
    2: '#b8c9b0',
    3: '#ccc5b0',
    4: '#c8bcb8',
    5: '#afc8c3',
    6: '#cdc3a4',
    7: '#b4bdc8',
    8: '#bfb4c8',
};

export function getCoverColor(genreId: number | null | undefined): string {
    return GENRE_COLORS[genreId ?? 0] ?? '#e8e5dc';
}

// Couleurs de couverture par lumière (boutures)
const LUMIERE_COLORS: Record<string, string> = {
    'plein-soleil': '#d4c9a8',
    'lumiere-vive': '#ccc3a0',
    'mi-ombre': '#b8c9b0',
    ombre: '#a4b89e',
};

export function getBoutureCoverColor(lumiere: string): string {
    return LUMIERE_COLORS[lumiere] ?? '#c8c9b8';
}

export const DIFFICULTE_LABELS: Record<string, string> = {
    facile: 'Facile',
    moyen: 'Intermédiaire',
    difficile: 'Exigeante',
};

export const LUMIERE_LABELS: Record<string, string> = {
    'plein-soleil': 'Plein soleil',
    'lumiere-vive': 'Lumière vive',
    'mi-ombre': 'Mi-ombre',
    ombre: 'Ombre',
};

export const ARROSAGE_LABELS: Record<string, string> = {
    regulier: 'Régulier',
    modere: 'Modéré',
    rare: 'Rare',
};
```

- [ ] **Vérifier** : `npx tsc --noEmit` — aucune erreur.

- [ ] **Test final** : `npm run dev` — naviguer sur `/`, `/livres`, `/livres/[slug]`, `/boutures`, `/boutures/[slug]`, `/surprendre`. Tout doit afficher des données réelles issues de la DB.

- [ ] **Commit**

```bash
git add lib/data.ts
git commit -m "refactor: reduce lib/data.ts to pure constants/helpers"
```

---

## Task 10 : `lib/actions/genres.ts` + `lib/actions/rayons.ts`

**Files:**

- Create: `lib/actions/genres.ts`
- Create: `lib/actions/rayons.ts`

- [ ] **Créer `lib/actions/genres.ts`** :

```ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { genres } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

function makeSlug(nom: string) {
    return nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const genreSchema = z.object({ nom: z.string().min(1) });

export async function getGenresList() {
    return db.select().from(genres).orderBy(asc(genres.nom));
}

export async function getGenre(id: number) {
    return db
        .select()
        .from(genres)
        .where(eq(genres.id, id))
        .limit(1)
        .then((r) => r[0] ?? null);
}

export async function createGenre(formData: FormData) {
    await requireAdmin();
    const { nom } = genreSchema.parse({ nom: formData.get('nom') });
    await db.insert(genres).values({ nom, slug: makeSlug(nom) });
    revalidatePath('/admin/genres');
    revalidateTag('livres');
    redirect('/admin/genres');
}

export async function updateGenre(id: number, formData: FormData) {
    await requireAdmin();
    const { nom } = genreSchema.parse({ nom: formData.get('nom') });
    await db
        .update(genres)
        .set({ nom, slug: makeSlug(nom) })
        .where(eq(genres.id, id));
    revalidatePath('/admin/genres');
    revalidateTag('livres');
    redirect('/admin/genres');
}

export async function deleteGenre(id: number) {
    await requireAdmin();
    await db.delete(genres).where(eq(genres.id, id));
    revalidatePath('/admin/genres');
    revalidateTag('livres');
}
```

- [ ] **Créer `lib/actions/rayons.ts`** :

```ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { rayons } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

function makeSlug(nom: string) {
    return nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const rayonSchema = z.object({
    nom: z.string().min(1),
    description: z.string().optional(),
});

export async function getRayonsList() {
    return db.select().from(rayons).orderBy(asc(rayons.nom));
}

export async function getRayon(id: number) {
    return db
        .select()
        .from(rayons)
        .where(eq(rayons.id, id))
        .limit(1)
        .then((r) => r[0] ?? null);
}

export async function createRayon(formData: FormData) {
    await requireAdmin();
    const data = rayonSchema.parse({
        nom: formData.get('nom'),
        description: formData.get('description') || undefined,
    });
    await db.insert(rayons).values({
        nom: data.nom,
        slug: makeSlug(data.nom),
        description: data.description ?? null,
    });
    revalidatePath('/admin/rayons');
    revalidateTag('livres');
    redirect('/admin/rayons');
}

export async function updateRayon(id: number, formData: FormData) {
    await requireAdmin();
    const data = rayonSchema.parse({
        nom: formData.get('nom'),
        description: formData.get('description') || undefined,
    });
    await db
        .update(rayons)
        .set({
            nom: data.nom,
            slug: makeSlug(data.nom),
            description: data.description ?? null,
        })
        .where(eq(rayons.id, id));
    revalidatePath('/admin/rayons');
    revalidateTag('livres');
    redirect('/admin/rayons');
}

export async function deleteRayon(id: number) {
    await requireAdmin();
    await db.delete(rayons).where(eq(rayons.id, id));
    revalidatePath('/admin/rayons');
    revalidateTag('livres');
}
```

- [ ] **Vérifier** : `npx tsc --noEmit`

- [ ] **Commit**

```bash
git add lib/actions/genres.ts lib/actions/rayons.ts
git commit -m "feat: CRUD server actions for genres and rayons"
```

---

## Task 11 : Pages admin genres

**Files:**

- Create: `app/admin/(protected)/genres/page.tsx`
- Create: `app/admin/(protected)/genres/nouveau/page.tsx`
- Create: `app/admin/(protected)/genres/[id]/modifier/page.tsx`

- [ ] **Créer `app/admin/(protected)/genres/page.tsx`** :

```tsx
import Link from 'next/link';
import { getGenresList, deleteGenre } from '@/lib/actions/genres';

export default async function AdminGenresPage() {
    const data = await getGenresList();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Genres
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} genre{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/genres/nouveau"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucun genre.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Nom
                                </th>
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden sm:table-cell">
                                    Slug
                                </th>
                                <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((genre) => (
                                <tr
                                    key={genre.id}
                                    className="border-b border-border/50 hover:bg-white transition-colors"
                                >
                                    <td className="py-3 pr-4 font-medium text-foreground">
                                        {genre.nom}
                                    </td>
                                    <td className="py-3 pr-4 text-muted font-mono text-xs hidden sm:table-cell">
                                        {genre.slug}
                                    </td>
                                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-4">
                                            <Link
                                                href={`/admin/genres/${genre.id}/modifier`}
                                                className="text-xs text-muted hover:text-primary transition-colors"
                                            >
                                                Modifier
                                            </Link>
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    await deleteGenre(genre.id);
                                                }}
                                                className="contents"
                                            >
                                                <button
                                                    type="submit"
                                                    className="text-xs text-muted hover:text-red-600 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Créer `app/admin/(protected)/genres/nouveau/page.tsx`** :

```tsx
import { createGenre } from '@/lib/actions/genres';

export default function NouveauGenrePage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouveau genre
            </h1>
            <form action={createGenre} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Nom
                    </label>
                    <input
                        name="nom"
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Créer
                    </button>
                    <a
                        href="/admin/genres"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
```

- [ ] **Créer `app/admin/(protected)/genres/[id]/modifier/page.tsx`** :

```tsx
import { notFound } from 'next/navigation';
import { getGenre, updateGenre } from '@/lib/actions/genres';

type Props = { params: Promise<{ id: string }> };

export default async function ModifierGenrePage({ params }: Props) {
    const { id } = await params;
    const genre = await getGenre(Number(id));
    if (!genre) notFound();

    const action = updateGenre.bind(null, genre.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier le genre
            </h1>
            <form action={action} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Nom
                    </label>
                    <input
                        name="nom"
                        defaultValue={genre.nom}
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Enregistrer
                    </button>
                    <a
                        href="/admin/genres"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
```

- [ ] **Test** : `npm run dev` → naviguer sur `/admin/genres` — liste s'affiche, formulaire création fonctionne, modification fonctionne, suppression fonctionne.

- [ ] **Commit**

```bash
git add "app/admin/(protected)/genres/"
git commit -m "feat: admin CRUD pages for genres"
```

---

## Task 12 : Pages admin rayons

**Files:**

- Create: `app/admin/(protected)/rayons/page.tsx`
- Create: `app/admin/(protected)/rayons/nouveau/page.tsx`
- Create: `app/admin/(protected)/rayons/[id]/modifier/page.tsx`

- [ ] **Créer `app/admin/(protected)/rayons/page.tsx`** :

```tsx
import Link from 'next/link';
import { getRayonsList, deleteRayon } from '@/lib/actions/rayons';

export default async function AdminRayonsPage() {
    const data = await getRayonsList();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Rayons
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} rayon{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/rayons/nouveau"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucun rayon.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Nom
                                </th>
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden sm:table-cell">
                                    Slug
                                </th>
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden md:table-cell">
                                    Description
                                </th>
                                <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((rayon) => (
                                <tr
                                    key={rayon.id}
                                    className="border-b border-border/50 hover:bg-white transition-colors"
                                >
                                    <td className="py-3 pr-4 font-medium text-foreground">
                                        {rayon.nom}
                                    </td>
                                    <td className="py-3 pr-4 text-muted font-mono text-xs hidden sm:table-cell">
                                        {rayon.slug}
                                    </td>
                                    <td className="py-3 pr-4 text-muted hidden md:table-cell">
                                        {rayon.description ?? '—'}
                                    </td>
                                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-4">
                                            <Link
                                                href={`/admin/rayons/${rayon.id}/modifier`}
                                                className="text-xs text-muted hover:text-primary transition-colors"
                                            >
                                                Modifier
                                            </Link>
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    await deleteRayon(rayon.id);
                                                }}
                                                className="contents"
                                            >
                                                <button
                                                    type="submit"
                                                    className="text-xs text-muted hover:text-red-600 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
```

- [ ] **Créer `app/admin/(protected)/rayons/nouveau/page.tsx`** :

```tsx
import { createRayon } from '@/lib/actions/rayons';

export default function NouveauRayonPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouveau rayon
            </h1>
            <form action={createRayon} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Nom
                    </label>
                    <input
                        name="nom"
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Description{' '}
                        <span className="normal-case">(optionnel)</span>
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Créer
                    </button>
                    <a
                        href="/admin/rayons"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
```

- [ ] **Créer `app/admin/(protected)/rayons/[id]/modifier/page.tsx`** :

```tsx
import { notFound } from 'next/navigation';
import { getRayon, updateRayon } from '@/lib/actions/rayons';

type Props = { params: Promise<{ id: string }> };

export default async function ModifierRayonPage({ params }: Props) {
    const { id } = await params;
    const rayon = await getRayon(Number(id));
    if (!rayon) notFound();

    const action = updateRayon.bind(null, rayon.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier le rayon
            </h1>
            <form action={action} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Nom
                    </label>
                    <input
                        name="nom"
                        defaultValue={rayon.nom}
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Description{' '}
                        <span className="normal-case">(optionnel)</span>
                    </label>
                    <textarea
                        name="description"
                        defaultValue={rayon.description ?? ''}
                        rows={3}
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Enregistrer
                    </button>
                    <a
                        href="/admin/rayons"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
```

- [ ] **Test** : `npm run dev` → `/admin/rayons` — CRUD complet fonctionne.

- [ ] **Commit**

```bash
git add "app/admin/(protected)/rayons/"
git commit -m "feat: admin CRUD pages for rayons"
```

---

## Task 13 : Mise à jour navigation admin

**Files:**

- Modify: `app/admin/(protected)/_components/AdminShell.tsx`

- [ ] **Ajouter Genres et Rayons dans `navItems`** — dans `AdminShell.tsx`, remplacer :

```ts
const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/livres', label: 'Livres' },
    { href: '/admin/boutures', label: 'Boutures' },
    { href: '/admin/avis', label: 'Avis' },
    { href: '/admin/evenements', label: 'Événements' },
    { href: '/admin/selections', label: 'Sélections' },
];
```

par :

```ts
const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/livres', label: 'Livres' },
    { href: '/admin/boutures', label: 'Boutures' },
    { href: '/admin/genres', label: 'Genres' },
    { href: '/admin/rayons', label: 'Rayons' },
    { href: '/admin/avis', label: 'Avis' },
    { href: '/admin/evenements', label: 'Événements' },
    { href: '/admin/selections', label: 'Sélections' },
];
```

- [ ] **Test** : `npm run dev` → vérifier que Genres et Rayons apparaissent dans la sidebar desktop et le menu mobile.

- [ ] **Commit**

```bash
git add "app/admin/(protected)/_components/AdminShell.tsx"
git commit -m "feat: add genres and rayons to admin nav"
```

---

## Vérification finale

- [ ] `npx tsc --noEmit` — zéro erreur TypeScript
- [ ] `npm run build` — build réussi
- [ ] Naviguer sur toutes les routes publiques et vérifier les données DB
- [ ] Créer un genre dans `/admin/genres`, vérifier qu'il apparaît dans la FilterBar de `/livres`
- [ ] Modifier un livre dans `/admin/livres`, vérifier que la fiche `/livres/[slug]` est mise à jour
- [ ] Vérifier `/sitemap.xml` — contient toutes les fiches DB

---

## Notes

**Seed :** Le seed existant (`db/seed.ts`) charge genres + rayons depuis les JSON. Il reste valide. Après migration admin, les nouveaux genres/rayons créés via back-office n'ont pas besoin d'être dans les JSON.

**Conflit de noms `getLivres` :** `lib/actions/livres.ts` exporte `getLivres` (admin, avec auth). Le nouveau `lib/queries/livres.ts` exporte `getLivresPubliques`. Pas de conflit — chemins d'import différents.

**`bouture.images[]` vs `bouture.image` :** Le JSON avait un tableau `images[]`. La DB a un champ `image` (string unique). Tous les accès `bouture.images?.[0]` dans les composants doivent être remplacés par `bouture.image`.

**Cache invalidation :** Les mutations admin (`createLivre`, `updateLivre`, `deleteLivre`, `updateStock`) appellent maintenant `revalidateTag('livres')` qui invalide toutes les queries front mises en cache avec `{ tags: ['livres'] }`. Idem pour `boutures`, `genres`, `rayons`.
