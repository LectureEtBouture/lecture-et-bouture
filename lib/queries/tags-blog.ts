import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { tagsBlog, articlesTags } from '@/db/schema';
import { eq, asc, or } from 'drizzle-orm';

export type TagBlog = { id: string; nom: string; slug: string };

export const getTagsBlog = unstable_cache(
    async (): Promise<TagBlog[]> =>
        db
            .select({ id: tagsBlog.id, nom: tagsBlog.nom, slug: tagsBlog.slug })
            .from(tagsBlog)
            .orderBy(asc(tagsBlog.nom)),
    ['tags-blog'],
    { tags: ['tags-blog'] },
);

export const getTagsArticle = unstable_cache(
    async (articleId: string): Promise<TagBlog[]> =>
        db
            .select({ id: tagsBlog.id, nom: tagsBlog.nom, slug: tagsBlog.slug })
            .from(tagsBlog)
            .innerJoin(articlesTags, eq(articlesTags.tagId, tagsBlog.id))
            .where(eq(articlesTags.articleId, articleId))
            .orderBy(asc(tagsBlog.nom)),
    ['tags-article'],
    { tags: ['tags-blog'] },
);

export const getTagsParArticles = unstable_cache(
    async (articleIds: string[]): Promise<Record<string, TagBlog[]>> => {
        if (articleIds.length === 0) return {};
        const rows = await db
            .select({
                articleId: articlesTags.articleId,
                id: tagsBlog.id,
                nom: tagsBlog.nom,
                slug: tagsBlog.slug,
            })
            .from(tagsBlog)
            .innerJoin(articlesTags, eq(articlesTags.tagId, tagsBlog.id))
            .where(
                or(...articleIds.map((id) => eq(articlesTags.articleId, id))),
            )
            .orderBy(asc(tagsBlog.nom));

        const byArticle: Record<string, TagBlog[]> = {};
        for (const row of rows) {
            if (!byArticle[row.articleId]) byArticle[row.articleId] = [];
            byArticle[row.articleId].push({
                id: row.id,
                nom: row.nom,
                slug: row.slug,
            });
        }
        return byArticle;
    },
    ['tags-par-articles'],
    { tags: ['tags-blog'] },
);
