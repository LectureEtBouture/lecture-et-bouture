import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { categoriesBlog } from '@/db/schema';
import { asc } from 'drizzle-orm';

export type CategorieBlog = {
    id: string;
    nom: string;
    slug: string;
};

export const getCategoriesBlog = unstable_cache(
    async (): Promise<CategorieBlog[]> =>
        db
            .select({
                id: categoriesBlog.id,
                nom: categoriesBlog.nom,
                slug: categoriesBlog.slug,
            })
            .from(categoriesBlog)
            .orderBy(asc(categoriesBlog.nom)),
    ['categories-blog'],
    { tags: ['categories-blog'] },
);
