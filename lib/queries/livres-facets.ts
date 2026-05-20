import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { livres, genres, rayons, livresGenres } from '@/db/schema';
import { eq, isNotNull } from 'drizzle-orm';

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
        const baseQuery = db
            .selectDistinct({
                id: genres.id,
                nom: genres.nom,
                slug: genres.slug,
            })
            .from(genres)
            .innerJoin(livresGenres, eq(livresGenres.genreId, genres.id))
            .innerJoin(livres, eq(livres.id, livresGenres.livreId));
        return rayonId
            ? baseQuery.where(eq(livres.rayonId, rayonId)).orderBy(genres.nom)
            : baseQuery.orderBy(genres.nom);
    },
    ['genres-actifs'],
    { tags: ['livres', 'genres'] },
);

export const getLivresSeries = unstable_cache(
    async () => {
        const rows = await db
            .selectDistinct({ serie: livres.serie })
            .from(livres)
            .where(isNotNull(livres.serie))
            .orderBy(livres.serie);
        return rows
            .filter((row): row is { serie: string } => row.serie !== null)
            .map((row) => row.serie);
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
        return rows
            .filter((row): row is { editeur: string } => row.editeur !== null)
            .map((row) => row.editeur);
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
        return rows
            .filter((row): row is { format: string } => row.format !== null)
            .map((row) => row.format);
    },
    ['livres-formats'],
    { tags: ['livres'] },
);

export type GenreFacette = Awaited<ReturnType<typeof getGenresActifs>>[number];
export type RayonFacette = Awaited<ReturnType<typeof getLivresRayons>>[number];
