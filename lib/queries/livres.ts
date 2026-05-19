import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { livres, genres, rayons } from '@/db/schema';
import {
    eq, and, asc, desc, ilike, or, isNotNull, notInArray, ne, type SQL,
} from 'drizzle-orm';

export type SortLivres =
    | 'alpha' | 'prix-asc' | 'prix-desc' | 'note' | 'date' | 'editeur';

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
        case 'alpha': return asc(livres.titre);
        case 'prix-asc': return asc(livres.prix);
        case 'prix-desc': return desc(livres.prix);
        case 'note': return desc(livres.noteMoyenne);
        case 'date': return desc(livres.publishedAt);
        case 'editeur': return asc(livres.editeur);
        default: return asc(livres.titre);
    }
}

export const getLivresPubliques = unstable_cache(
    async (filters: LivresFilters = {}) => {
        const conditions: SQL[] = [];
        if (filters.rayon) conditions.push(eq(livres.rayonId, filters.rayon));
        if (filters.genre) conditions.push(eq(livres.genreId, filters.genre));
        if (filters.serie) conditions.push(eq(livres.serie, filters.serie));
        if (filters.editeur) conditions.push(eq(livres.editeur, filters.editeur));
        if (filters.format) conditions.push(eq(livres.format, filters.format));
        if (filters.choixLibrairie) conditions.push(eq(livres.choixLibrairie, true));
        if (filters.q) {
            const pattern = `%${filters.q}%`;
            conditions.push(
                or(
                    ilike(livres.titre, pattern),
                    ilike(livres.auteur, pattern),
                    ilike(livres.collection, pattern),
                    ilike(livres.editeur, pattern),
                    ilike(livres.serie, pattern),
                )!,
            );
        }
        const query = db.select(livreSelect).from(livres).orderBy(buildOrderBy(filters.sort));
        return conditions.length > 0 ? query.where(and(...conditions)) : query;
    },
    ['livres-publiques'],
    { tags: ['livres'] },
);

export type LivrePublique = Awaited<ReturnType<typeof getLivresPubliques>>[number];

export const getLivreBySlug = unstable_cache(
    async (slug: string) =>
        db.select(livreSelect).from(livres).where(eq(livres.slug, slug))
            .limit(1).then(rows => rows[0] ?? null),
    ['livre-by-slug'],
    { tags: ['livres'] },
);

export const getLivresMisEnAvant = unstable_cache(
    async () =>
        db.select(livreSelect).from(livres)
            .where(eq(livres.choixLibrairie, true))
            .orderBy(asc(livres.titre)),
    ['livres-mis-en-avant'],
    { tags: ['livres'] },
);

export const getLivresRayons = unstable_cache(
    async () =>
        db.selectDistinct({ id: rayons.id, nom: rayons.nom, slug: rayons.slug })
            .from(rayons)
            .innerJoin(livres, eq(livres.rayonId, rayons.id))
            .orderBy(rayons.nom),
    ['livres-rayons'],
    { tags: ['livres'] },
);

export const getGenresActifs = unstable_cache(
    async (rayonId?: number) => {
        const baseQuery = db
            .selectDistinct({ id: genres.id, nom: genres.nom, slug: genres.slug })
            .from(genres)
            .innerJoin(livres, eq(livres.genreId, genres.id));
        return rayonId
            ? baseQuery.where(eq(livres.rayonId, rayonId)).orderBy(genres.nom)
            : baseQuery.orderBy(genres.nom);
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
        return rows.map(row => row.serie as string);
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
        return rows.map(row => row.editeur as string);
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
        return rows.map(row => row.format as string);
    },
    ['livres-formats'],
    { tags: ['livres'] },
);

export const getGenreById = unstable_cache(
    async (id: number) =>
        db.select().from(genres).where(eq(genres.id, id))
            .limit(1).then(rows => rows[0] ?? null),
    ['genre-by-id'],
    { tags: ['genres'] },
);

export const getRayonById = unstable_cache(
    async (id: number) =>
        db.select().from(rayons).where(eq(rayons.id, id))
            .limit(1).then(rows => rows[0] ?? null),
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
            ? await db.select(livreSelect).from(livres)
                  .where(and(eq(livres.serie, serie), ne(livres.id, livreId)))
                  .orderBy(asc(livres.numeroSerie))
            : [];

        const excludeForGenre = memeSerie.map(livre => livre.id);
        const genreConditions: SQL[] = [ne(livres.id, livreId)];
        if (genreId) genreConditions.push(eq(livres.genreId, genreId));
        if (excludeForGenre.length > 0) genreConditions.push(notInArray(livres.id, excludeForGenre));

        const memeGenre = genreId
            ? await db.select(livreSelect).from(livres)
                  .where(and(...genreConditions))
                  .orderBy(desc(livres.noteMoyenne))
                  .limit(limit)
            : [];

        const excludeForAuteur = [...memeSerie.map(livre => livre.id), ...memeGenre.map(livre => livre.id)];
        const auteurConditions: SQL[] = [eq(livres.auteur, auteur), ne(livres.id, livreId)];
        if (excludeForAuteur.length > 0) auteurConditions.push(notInArray(livres.id, excludeForAuteur));

        const memeAuteur = await db.select(livreSelect).from(livres)
            .where(and(...auteurConditions))
            .orderBy(desc(livres.noteMoyenne))
            .limit(limit);

        return { memeSerie, memeGenre, memeAuteur };
    },
    ['livres-recos'],
    { tags: ['livres'] },
);
