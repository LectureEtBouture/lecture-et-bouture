import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { livres } from '@/db/schema';
import { and, ne, sql, type SQL } from 'drizzle-orm';
import type {
    LivreComplet,
    EnrichissementLocal,
} from '@/lib/services/books/types';
import { bookProvider } from '@/lib/services/books';
import { fusionnerListe } from '@/lib/services/books/merge';
import { getEnrichissementByUri } from './enrichissements';

export type Recommendations = {
    memeGenre: LivreComplet[];
};

export const getRecommendations = unstable_cache(
    async (
        localId: string,
        genreId: string | null,
        limit = 4,
    ): Promise<Recommendations> => {
        if (!genreId) return { memeGenre: [] };

        const conditions: SQL[] = [ne(livres.id, localId)];
        conditions.push(
            sql`EXISTS (SELECT 1 FROM livres_genres WHERE livre_id = ${livres.id} AND genre_id = ${genreId})`,
        );

        const rows = await db
            .select({
                id: livres.id,
                inventaireUri: livres.inventaireUri,
            })
            .from(livres)
            .where(and(...conditions))
            .limit(limit);

        if (rows.length === 0) return { memeGenre: [] };

        const uris = rows.map((row) => row.inventaireUri);
        const [metas, enrichissements] = await Promise.all([
            bookProvider.rechercherParUris(uris),
            Promise.all(uris.map((uri) => getEnrichissementByUri(uri))),
        ]);
        const enrichMap = new Map<string, EnrichissementLocal>(
            uris
                .map((uri, i) => [uri, enrichissements[i]] as const)
                .filter(
                    (pair): pair is [string, EnrichissementLocal] =>
                        pair[1] !== null,
                ),
        );

        return { memeGenre: fusionnerListe(metas, enrichMap, uris) };
    },
    ['livres-recos'],
    { tags: ['livres'] },
);
