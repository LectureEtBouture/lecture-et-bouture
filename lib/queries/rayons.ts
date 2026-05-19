import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { rayons } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const getRayonById = unstable_cache(
    async (id: number) =>
        db.select().from(rayons).where(eq(rayons.id, id))
            .limit(1).then(rows => rows[0] ?? null),
    ['rayon-by-id'],
    { tags: ['rayons'] },
);

export type RayonPublique = Awaited<ReturnType<typeof getRayonById>>;
