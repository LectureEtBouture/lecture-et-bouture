import { unstable_cache } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { avis } from '@/db/schema';

export type AvisItem = {
    id: string;
    auteurNom: string;
    note: number | null;
    texte: string | null;
    createdAt: Date;
};

const select = {
    id: avis.id,
    auteurNom: avis.auteurNom,
    note: avis.note,
    texte: avis.texte,
    createdAt: avis.createdAt,
} as const;

export const getAvisForLivre = unstable_cache(
    async (livreId: string): Promise<AvisItem[]> =>
        db
            .select(select)
            .from(avis)
            .where(
                and(
                    eq(avis.type, 'livre'),
                    eq(avis.livreId, livreId),
                    eq(avis.approuve, true),
                    eq(avis.masque, false),
                ),
            )
            .orderBy(avis.createdAt),
    ['avis-livre'],
    { tags: ['avis'] },
);

export const getAvisForBouture = unstable_cache(
    async (boutureId: string): Promise<AvisItem[]> =>
        db
            .select(select)
            .from(avis)
            .where(
                and(
                    eq(avis.type, 'bouture'),
                    eq(avis.boutureId, boutureId),
                    eq(avis.approuve, true),
                    eq(avis.masque, false),
                ),
            )
            .orderBy(avis.createdAt),
    ['avis-bouture'],
    { tags: ['avis'] },
);

export const getAvisForArticle = unstable_cache(
    async (articleId: string): Promise<AvisItem[]> =>
        db
            .select(select)
            .from(avis)
            .where(
                and(
                    eq(avis.type, 'article'),
                    eq(avis.articleId, articleId),
                    eq(avis.approuve, true),
                    eq(avis.masque, false),
                ),
            )
            .orderBy(avis.createdAt),
    ['avis-article'],
    { tags: ['avis'] },
);
