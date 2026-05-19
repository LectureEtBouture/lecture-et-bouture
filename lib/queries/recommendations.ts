import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { livres } from '@/db/schema';
import { and, asc, desc, eq, notInArray, ne, sql, type SQL } from 'drizzle-orm';
import { livreSelect, type LivrePublique } from './livres';

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

        const excludeForGenre = memeSerie.map((livre) => livre.id);
        const genreConditions: SQL[] = [ne(livres.id, livreId)];
        if (genreId)
            genreConditions.push(
                sql`EXISTS (SELECT 1 FROM livres_genres WHERE livre_id = ${livres.id} AND genre_id = ${genreId})`,
            );
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
            ...memeSerie.map((livre) => livre.id),
            ...memeGenre.map((livre) => livre.id),
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
