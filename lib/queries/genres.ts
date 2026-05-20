import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { genres } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const getGenreById = unstable_cache(
    async (id: string) =>
        db
            .select()
            .from(genres)
            .where(eq(genres.id, id))
            .limit(1)
            .then((rows) => rows[0] ?? null),
    ['genre-by-id'],
    { tags: ['genres'] },
);

export type GenrePublique = Awaited<ReturnType<typeof getGenreById>>;
