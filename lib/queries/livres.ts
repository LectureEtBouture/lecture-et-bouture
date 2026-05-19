import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { livres } from '@/db/schema';
import { eq, and, asc, desc, ilike, or, type SQL } from 'drizzle-orm';

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

export const livreSelect = {
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

export type LivrePublique = Awaited<ReturnType<typeof getLivresPubliques>>[number];

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
        if (filters.editeur) conditions.push(eq(livres.editeur, filters.editeur));
        if (filters.format) conditions.push(eq(livres.format, filters.format));
        if (filters.choixLibrairie) conditions.push(eq(livres.choixLibrairie, true));
        if (filters.q) {
            const pattern = `%${filters.q}%`;
            const searchCondition = or(
                ilike(livres.titre, pattern),
                ilike(livres.auteur, pattern),
                ilike(livres.collection, pattern),
                ilike(livres.editeur, pattern),
                ilike(livres.serie, pattern),
            );
            if (searchCondition) conditions.push(searchCondition);
        }
        const query = db.select(livreSelect).from(livres).orderBy(buildOrderBy(filters.sort));
        return conditions.length > 0 ? query.where(and(...conditions)) : query;
    },
    ['livres-publiques'],
    { tags: ['livres'] },
);

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
