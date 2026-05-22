import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { auteursBlog } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const getAuteursBlog = unstable_cache(
    async () =>
        db
            .select({ id: auteursBlog.id, nom: auteursBlog.nom })
            .from(auteursBlog)
            .orderBy(asc(auteursBlog.nom)),
    ['auteurs-blog'],
    { tags: ['auteurs-blog'] },
);
