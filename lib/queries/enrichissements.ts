import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { livres, livresGenres, rayons } from '@/db/schema';
import { eq, and, sql, desc, asc, type SQL } from 'drizzle-orm';

export type SortEnrichissements = 'date' | 'note' | 'prix-asc' | 'prix-desc';
import type { EnrichissementLocal } from '@/lib/services/books/types';

async function rowToEnrichissement(row: {
    id: string;
    inventaireUri: string;
    prix: string | null;
    choixLibrairie: boolean;
    noteDeLaLibrairie: string | null;
    rayonId: string | null;
    numeroSerie: number | null;
    noteMoyenne: string | null;
    image: string | null;
    imageAlt: string | null;
}): Promise<EnrichissementLocal> {
    const genreRows = await db
        .select({ genreId: livresGenres.genreId })
        .from(livresGenres)
        .where(eq(livresGenres.livreId, row.id));
    return {
        localId: row.id,
        inventaireUri: row.inventaireUri,
        prix: row.prix,
        choixLibrairie: row.choixLibrairie,
        noteDeLaLibrairie: row.noteDeLaLibrairie,
        rayonId: row.rayonId,
        genreIds: genreRows.map((g) => g.genreId),
        numeroSerie: row.numeroSerie,
        noteMoyenne: row.noteMoyenne,
        image: row.image,
        imageAlt: row.imageAlt,
    };
}

export interface EnrichissementsFilters {
    rayonId?: string;
    rayonSlug?: string;
    genreId?: string;
    choixLibrairie?: boolean;
    sort?: SortEnrichissements;
    limit?: number;
    offset?: number;
}

const enrichissementSelect = {
    id: livres.id,
    inventaireUri: livres.inventaireUri,
    prix: livres.prix,
    choixLibrairie: livres.choixLibrairie,
    noteDeLaLibrairie: livres.noteDeLaLibrairie,
    rayonId: livres.rayonId,
    numeroSerie: livres.numeroSerie,
    noteMoyenne: livres.noteMoyenne,
    image: livres.image,
    imageAlt: livres.imageAlt,
} as const;

function buildConditions(
    filters: Omit<EnrichissementsFilters, 'sort' | 'limit' | 'offset'>,
): SQL[] {
    const conditions: SQL[] = [];
    if (filters.choixLibrairie)
        conditions.push(eq(livres.choixLibrairie, true));
    if (filters.rayonId) conditions.push(eq(livres.rayonId, filters.rayonId));
    if (filters.rayonSlug) {
        conditions.push(
            sql`EXISTS (SELECT 1 FROM rayons WHERE id = ${livres.rayonId} AND slug = ${filters.rayonSlug})`,
        );
    }
    if (filters.genreId) {
        conditions.push(
            sql`EXISTS (SELECT 1 FROM livres_genres WHERE livre_id = ${livres.id} AND genre_id = ${filters.genreId})`,
        );
    }
    return conditions;
}

export const getEnrichissements = unstable_cache(
    async (filters: EnrichissementsFilters = {}) => {
        const conditions = buildConditions(filters);

        const orderBy =
            filters.sort === 'note'
                ? desc(livres.noteMoyenne)
                : filters.sort === 'prix-asc'
                  ? asc(livres.prix)
                  : filters.sort === 'prix-desc'
                    ? desc(livres.prix)
                    : desc(livres.createdAt);

        const base = db
            .select(enrichissementSelect)
            .from(livres)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(orderBy);

        const rows =
            filters.limit !== undefined
                ? await base.limit(filters.limit).offset(filters.offset ?? 0)
                : await base;

        return Promise.all(rows.map(rowToEnrichissement));
    },
    ['enrichissements'],
    { tags: ['livres'] },
);

export const getEnrichissementsCount = unstable_cache(
    async (filters: Omit<EnrichissementsFilters, 'limit' | 'offset'> = {}) => {
        const conditions = buildConditions(filters);
        const [row] = await db
            .select({ total: sql<number>`count(*)` })
            .from(livres)
            .where(conditions.length > 0 ? and(...conditions) : undefined);
        return Number(row.total);
    },
    ['enrichissements-count'],
    { tags: ['livres'] },
);

export const getChoixLibrairie = unstable_cache(
    async () => {
        const rows = await db
            .select(enrichissementSelect)
            .from(livres)
            .where(eq(livres.choixLibrairie, true))
            .orderBy(livres.createdAt);
        return Promise.all(rows.map(rowToEnrichissement));
    },
    ['choix-librairie'],
    { tags: ['livres'] },
);

export const getEnrichissementByUri = unstable_cache(
    async (inventaireUri: string) => {
        const rows = await db
            .select(enrichissementSelect)
            .from(livres)
            .where(eq(livres.inventaireUri, inventaireUri))
            .limit(1);
        if (rows.length === 0) return null;
        return rowToEnrichissement(rows[0]);
    },
    ['enrichissement-by-uri'],
    { tags: ['livres'] },
);

export const getEnrichissementById = unstable_cache(
    async (id: string) => {
        const rows = await db
            .select(enrichissementSelect)
            .from(livres)
            .where(eq(livres.id, id))
            .limit(1);
        if (rows.length === 0) return null;
        return rowToEnrichissement(rows[0]);
    },
    ['enrichissement-by-id'],
    { tags: ['livres'] },
);

export async function getOrCreateEnrichissement(
    inventaireUri: string,
): Promise<EnrichissementLocal> {
    const existing = await getEnrichissementByUri(inventaireUri);
    if (existing) return existing;
    const [row] = await db
        .insert(livres)
        .values({ inventaireUri })
        .returning(enrichissementSelect);
    return rowToEnrichissement(row);
}

export const getEnrichissementsRayons = unstable_cache(
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
    ['enrichissements-rayons'],
    { tags: ['livres'] },
);
