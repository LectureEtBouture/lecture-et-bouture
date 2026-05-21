import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { genres, livresGenres, livres, rayons } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    async (rayonId?: string) => {
        const base = db
            .selectDistinct({
                id: genres.id,
                nom: genres.nom,
                slug: genres.slug,
            })
            .from(genres)
            .innerJoin(livresGenres, eq(livresGenres.genreId, genres.id))
            .innerJoin(livres, eq(livres.id, livresGenres.livreId));
        return rayonId
            ? base.where(eq(livres.rayonId, rayonId)).orderBy(genres.nom)
            : base.orderBy(genres.nom);
    },
    ['genres-actifs'],
    { tags: ['livres', 'genres'] },
);

export type GenreFacette = Awaited<ReturnType<typeof getGenresActifs>>[number];
export type RayonFacette = Awaited<ReturnType<typeof getLivresRayons>>[number];
