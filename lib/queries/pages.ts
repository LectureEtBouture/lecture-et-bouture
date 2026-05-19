import { unstable_cache } from 'next/cache';
import { draftMode } from 'next/headers';
import { db } from '@/db';
import { pagesEditoriales } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export const getPageEditoriale = unstable_cache(
    async (slug: string) =>
        db
            .select()
            .from(pagesEditoriales)
            .where(
                and(
                    eq(pagesEditoriales.slug, slug),
                    eq(pagesEditoriales.publiee, true),
                ),
            )
            .limit(1)
            .then((rows) => rows[0] ?? null),
    ['page-editoriale'],
    { tags: ['pages'] },
);

export async function getPageEditorialeDraft(slug: string) {
    return db
        .select()
        .from(pagesEditoriales)
        .where(eq(pagesEditoriales.slug, slug))
        .limit(1)
        .then((rows) => rows[0] ?? null);
}

export async function fetchPageEditorialeWithDraft(slug: string) {
    const { isEnabled } = await draftMode();
    return isEnabled ? getPageEditorialeDraft(slug) : getPageEditoriale(slug);
}

export type PageEditoriale = Awaited<ReturnType<typeof getPageEditoriale>>;

export const getPublishedEditorialSlugs = unstable_cache(
    async () =>
        db
            .select({ slug: pagesEditoriales.slug })
            .from(pagesEditoriales)
            .where(eq(pagesEditoriales.publiee, true))
            .then((rows) => rows.map((row) => row.slug)),
    ['published-editorial-slugs'],
    { tags: ['pages'] },
);
