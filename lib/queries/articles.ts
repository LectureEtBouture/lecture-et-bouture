import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import {
    articles,
    articlesCategories,
    categoriesBlog,
    articlesTags,
    tagsBlog,
    articlesLies,
} from '@/db/schema';
import { eq, desc, and, or, asc } from 'drizzle-orm';
import { extraireTexte } from '@/lib/extrait';

const articleSelect = {
    id: articles.id,
    slug: articles.slug,
    titre: articles.titre,
    contenu: articles.contenu,
    image: articles.image,
    imageAlt: articles.imageAlt,
    auteurNom: articles.auteurNom,
    publie: articles.publie,
    enAvant: articles.enAvant,
    publishedAt: articles.publishedAt,
    createdAt: articles.createdAt,
    updatedAt: articles.updatedAt,
} as const;

export type ArticleItem = Awaited<ReturnType<typeof getArticles>>[number];

export type ArticleAvecExtrait = ArticleItem & { extrait: string };

export type ArticlesSort = 'recents' | 'anciens' | 'alpha';

export const getArticles = unstable_cache(
    async (
        categorieSlug?: string,
        sort: ArticlesSort = 'recents',
        tag?: string,
    ) => {
        const orderBy =
            sort === 'anciens'
                ? asc(articles.publishedAt)
                : sort === 'alpha'
                  ? asc(articles.titre)
                  : desc(articles.publishedAt);

        if (tag) {
            return db
                .select(articleSelect)
                .from(articles)
                .innerJoin(
                    articlesTags,
                    eq(articlesTags.articleId, articles.id),
                )
                .innerJoin(tagsBlog, eq(tagsBlog.id, articlesTags.tagId))
                .where(and(eq(articles.publie, true), eq(tagsBlog.slug, tag)))
                .orderBy(orderBy);
        }

        if (categorieSlug) {
            return db
                .select(articleSelect)
                .from(articles)
                .innerJoin(
                    articlesCategories,
                    eq(articlesCategories.articleId, articles.id),
                )
                .innerJoin(
                    categoriesBlog,
                    eq(categoriesBlog.id, articlesCategories.categorieId),
                )
                .where(
                    and(
                        eq(articles.publie, true),
                        eq(categoriesBlog.slug, categorieSlug),
                    ),
                )
                .orderBy(orderBy);
        }

        return db
            .select(articleSelect)
            .from(articles)
            .where(eq(articles.publie, true))
            .orderBy(orderBy);
    },
    ['articles'],
    { tags: ['articles', 'tags-blog'] },
);

export const getArticlesAdmin = unstable_cache(
    async (tagSlug?: string) => {
        if (tagSlug) {
            return db
                .select(articleSelect)
                .from(articles)
                .innerJoin(
                    articlesTags,
                    eq(articlesTags.articleId, articles.id),
                )
                .innerJoin(tagsBlog, eq(tagsBlog.id, articlesTags.tagId))
                .where(eq(tagsBlog.slug, tagSlug))
                .orderBy(desc(articles.createdAt));
        }
        return db
            .select(articleSelect)
            .from(articles)
            .orderBy(desc(articles.createdAt));
    },
    ['articles-admin'],
    { tags: ['articles', 'tags-blog'] },
);

export const getArticleBySlug = unstable_cache(
    async (slug: string) =>
        db
            .select(articleSelect)
            .from(articles)
            .where(eq(articles.slug, slug))
            .limit(1)
            .then((rows) => rows[0] ?? null),
    ['article-by-slug'],
    { tags: ['articles'] },
);

export const getArticleById = unstable_cache(
    async (id: string) =>
        db
            .select(articleSelect)
            .from(articles)
            .where(eq(articles.id, id))
            .limit(1)
            .then((rows) => rows[0] ?? null),
    ['article-by-id'],
    { tags: ['articles'] },
);

export const getArticlesEnAvant = unstable_cache(
    async (): Promise<ArticleAvecExtrait[]> => {
        const enAvant = await db
            .select(articleSelect)
            .from(articles)
            .where(and(eq(articles.publie, true), eq(articles.enAvant, true)))
            .orderBy(desc(articles.publishedAt))
            .limit(4);

        const source =
            enAvant.length > 0
                ? enAvant
                : await db
                      .select(articleSelect)
                      .from(articles)
                      .where(eq(articles.publie, true))
                      .orderBy(desc(articles.publishedAt))
                      .limit(4);

        return source.map((article) => ({
            ...article,
            extrait: extraireTexte(article.contenu ?? ''),
        }));
    },
    ['articles-en-avant'],
    { tags: ['articles'] },
);

export const getArticlesParCategorie = unstable_cache(
    async (categorieId: string) =>
        db
            .select(articleSelect)
            .from(articles)
            .innerJoin(
                articlesCategories,
                eq(articlesCategories.articleId, articles.id),
            )
            .where(
                and(
                    eq(articles.publie, true),
                    eq(articlesCategories.categorieId, categorieId),
                ),
            )
            .orderBy(desc(articles.publishedAt)),
    ['articles-par-categorie'],
    { tags: ['articles'] },
);

export const getArticlesLies = unstable_cache(
    async (articleId: string) => {
        const rows = await db
            .select({ autreId: articlesLies.articleAId })
            .from(articlesLies)
            .where(eq(articlesLies.articleBId, articleId))
            .unionAll(
                db
                    .select({ autreId: articlesLies.articleBId })
                    .from(articlesLies)
                    .where(eq(articlesLies.articleAId, articleId)),
            );

        if (rows.length === 0) return [];

        const ids = rows.map((row) => row.autreId);
        return db
            .select(articleSelect)
            .from(articles)
            .where(
                and(
                    eq(articles.publie, true),
                    or(...ids.map((id) => eq(articles.id, id))),
                ),
            );
    },
    ['articles-lies'],
    { tags: ['articles'] },
);

export const getCategoriesParArticles = unstable_cache(
    async (articleIds: string[]) => {
        if (articleIds.length === 0) return {};
        const rows = await db
            .select({
                articleId: articlesCategories.articleId,
                id: categoriesBlog.id,
                nom: categoriesBlog.nom,
                slug: categoriesBlog.slug,
            })
            .from(categoriesBlog)
            .innerJoin(
                articlesCategories,
                eq(articlesCategories.categorieId, categoriesBlog.id),
            )
            .where(
                or(
                    ...articleIds.map((id) =>
                        eq(articlesCategories.articleId, id),
                    ),
                ),
            )
            .orderBy(asc(categoriesBlog.nom));

        const byArticle: Record<
            string,
            { id: string; nom: string; slug: string }[]
        > = {};
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
    ['categories-par-articles'],
    { tags: ['articles', 'categories-blog'] },
);

export const getCategoriesArticle = unstable_cache(
    async (articleId: string) =>
        db
            .select({
                id: categoriesBlog.id,
                nom: categoriesBlog.nom,
                slug: categoriesBlog.slug,
            })
            .from(categoriesBlog)
            .innerJoin(
                articlesCategories,
                eq(articlesCategories.categorieId, categoriesBlog.id),
            )
            .where(eq(articlesCategories.articleId, articleId))
            .orderBy(asc(categoriesBlog.nom)),
    ['categories-article'],
    { tags: ['articles', 'categories-blog'] },
);
