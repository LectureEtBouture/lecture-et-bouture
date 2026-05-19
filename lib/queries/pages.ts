import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { pagesEditoriales } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const getPageEditoriale = unstable_cache(
    async (slug: string) =>
        db
            .select()
            .from(pagesEditoriales)
            .where(and(eq(pagesEditoriales.slug, slug), eq(pagesEditoriales.publiee, true)))
            .limit(1)
            .then((rows) => rows[0] ?? null),
    ['page-editoriale'],
    { tags: ['pages'] },
);

export type PageEditoriale = Awaited<ReturnType<typeof getPageEditoriale>>;
