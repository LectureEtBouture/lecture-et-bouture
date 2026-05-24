'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import {
    articles,
    articlesCategories,
    articlesTags,
    articlesLies,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';
import { slugify } from '@/lib/slugify';

async function requireEditor() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

const articleSchema = z.object({
    titre: z.string().min(1),
    slug: z.string().min(1),
    contenu: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    auteurNom: z.string().optional(),
    publie: z.boolean().default(false),
    enAvant: z.boolean().default(false),
    categorieIds: z.array(z.string()).default([]),
    tagIds: z.array(z.string()).default([]),
});

function invalidate() {
    revalidateTag('articles', { expire: 0 });
    revalidateTag('articles-en-avant', { expire: 0 });
    revalidateTag('categories-blog', { expire: 0 });
    revalidateTag('tags-blog', { expire: 0 });
}

export async function createArticle(formData: FormData) {
    await requireEditor();

    const titre = (formData.get('titre') as string) ?? '';
    const parsed = articleSchema.parse({
        titre,
        slug: (formData.get('slug') as string) || slugify(titre),
        contenu: (formData.get('contenu') as string) || undefined,
        image: (formData.get('image') as string) || undefined,
        imageAlt: (formData.get('imageAlt') as string) || undefined,
        auteurNom: (formData.get('auteurNom') as string) || undefined,
        publie: formData.get('publie') === 'on',
        enAvant: formData.get('enAvant') === 'on',
        categorieIds: formData.getAll('categorieIds') as string[],
        tagIds: formData.getAll('tagIds') as string[],
    });

    const publishedAt = parsed.publie ? new Date() : null;

    const [article] = await db
        .insert(articles)
        .values({
            titre: parsed.titre,
            slug: parsed.slug,
            contenu: parsed.contenu ?? null,
            image: parsed.image ?? null,
            imageAlt: parsed.imageAlt ?? null,
            auteurNom: parsed.auteurNom ?? null,
            publie: parsed.publie,
            enAvant: parsed.enAvant,
            publishedAt,
        })
        .returning({ id: articles.id });

    if (parsed.categorieIds.length > 0) {
        await db.insert(articlesCategories).values(
            parsed.categorieIds.map((categorieId) => ({
                articleId: article.id,
                categorieId,
            })),
        );
    }

    if (parsed.tagIds.length > 0) {
        await db
            .insert(articlesTags)
            .values(
                parsed.tagIds.map((tagId) => ({
                    articleId: article.id,
                    tagId,
                })),
            );
    }

    invalidate();
    redirect(`/admin/blog/${article.id}/modifier`);
}

export async function updateArticle(id: string, formData: FormData) {
    await requireEditor();

    const titre = (formData.get('titre') as string) ?? '';
    const parsed = articleSchema.parse({
        titre,
        slug: (formData.get('slug') as string) || slugify(titre),
        contenu: (formData.get('contenu') as string) || undefined,
        image: (formData.get('image') as string) || undefined,
        imageAlt: (formData.get('imageAlt') as string) || undefined,
        auteurNom: (formData.get('auteurNom') as string) || undefined,
        publie: formData.get('publie') === 'on',
        enAvant: formData.get('enAvant') === 'on',
        categorieIds: formData.getAll('categorieIds') as string[],
        tagIds: formData.getAll('tagIds') as string[],
    });

    const existing = await db
        .select({ publie: articles.publie, publishedAt: articles.publishedAt })
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1)
        .then((rows) => rows[0]);

    const publishedAt =
        parsed.publie && !existing?.publishedAt
            ? new Date()
            : (existing?.publishedAt ?? null);

    await db
        .update(articles)
        .set({
            titre: parsed.titre,
            slug: parsed.slug,
            contenu: parsed.contenu ?? null,
            image: parsed.image ?? null,
            imageAlt: parsed.imageAlt ?? null,
            auteurNom: parsed.auteurNom ?? null,
            publie: parsed.publie,
            enAvant: parsed.enAvant,
            publishedAt,
            updatedAt: new Date(),
        })
        .where(eq(articles.id, id));

    await db
        .delete(articlesCategories)
        .where(eq(articlesCategories.articleId, id));

    if (parsed.categorieIds.length > 0) {
        await db.insert(articlesCategories).values(
            parsed.categorieIds.map((categorieId) => ({
                articleId: id,
                categorieId,
            })),
        );
    }

    await db.delete(articlesTags).where(eq(articlesTags.articleId, id));

    if (parsed.tagIds.length > 0) {
        await db
            .insert(articlesTags)
            .values(parsed.tagIds.map((tagId) => ({ articleId: id, tagId })));
    }

    invalidate();
}

export async function deleteArticle(id: string) {
    await requireEditor();
    await db.delete(articles).where(eq(articles.id, id));
    invalidate();
    redirect('/admin/blog');
}

export async function togglePublie(id: string) {
    await requireEditor();
    const [row] = await db
        .select({ publie: articles.publie, publishedAt: articles.publishedAt })
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);
    if (!row) return;
    const nowPublie = !row.publie;
    await db
        .update(articles)
        .set({
            publie: nowPublie,
            publishedAt:
                nowPublie && !row.publishedAt ? new Date() : row.publishedAt,
            updatedAt: new Date(),
        })
        .where(eq(articles.id, id));
    invalidate();
}

export async function toggleEnAvant(id: string) {
    await requireEditor();
    const [row] = await db
        .select({ enAvant: articles.enAvant })
        .from(articles)
        .where(eq(articles.id, id))
        .limit(1);
    if (!row) return;
    await db
        .update(articles)
        .set({ enAvant: !row.enAvant, updatedAt: new Date() })
        .where(eq(articles.id, id));
    invalidate();
}

function canonicalPair(
    a: string,
    b: string,
): { articleAId: string; articleBId: string } {
    return a < b
        ? { articleAId: a, articleBId: b }
        : { articleAId: b, articleBId: a };
}

export async function addArticleLien(articleId: string, autreId: string) {
    await requireEditor();
    if (articleId === autreId) return;
    const pair = canonicalPair(articleId, autreId);
    await db.insert(articlesLies).values(pair).onConflictDoNothing();
    revalidateTag('articles', 'max');
}

export async function removeArticleLien(articleId: string, autreId: string) {
    await requireEditor();
    const pair = canonicalPair(articleId, autreId);
    await db
        .delete(articlesLies)
        .where(
            and(
                eq(articlesLies.articleAId, pair.articleAId),
                eq(articlesLies.articleBId, pair.articleBId),
            ),
        );
    revalidateTag('articles', 'max');
}
