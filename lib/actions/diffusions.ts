'use server';

import { db } from '@/db';
import { diffusions, newsletterSubscribers, articles } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { extraireTexte } from '@/lib/extrait';
import { sendNewsletterDiffusion } from '@/services/resend';

export async function getDiffusionForArticle(articleId: string) {
    const rows = await db
        .select()
        .from(diffusions)
        .where(eq(diffusions.articleId, articleId))
        .orderBy(desc(diffusions.sentAt))
        .limit(1);
    return rows[0] ?? null;
}

export async function getSubscriberCount() {
    const rows = await db
        .select({ email: newsletterSubscribers.email })
        .from(newsletterSubscribers);
    return rows.length;
}

export async function diffuserArticle(
    articleId: string,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
    const article = await db
        .select()
        .from(articles)
        .where(eq(articles.id, articleId))
        .limit(1)
        .then((rows) => rows[0] ?? null);

    if (!article) return { ok: false, error: 'Article introuvable.' };
    if (!article.publie) return { ok: false, error: 'Article non publié.' };

    const subscribers = await db
        .select({ email: newsletterSubscribers.email })
        .from(newsletterSubscribers);

    if (subscribers.length === 0) return { ok: false, error: 'Aucun abonné.' };

    const extrait = article.contenu ? extraireTexte(article.contenu, 200) : '';

    let sent = 0;
    for (const sub of subscribers) {
        try {
            await sendNewsletterDiffusion({
                to: sub.email,
                articleTitre: article.titre,
                articleSlug: article.slug,
                articleImage: article.image,
                articleImageAlt: article.imageAlt,
                extrait,
            });
            sent++;
        } catch {
            // continue on individual failure
        }
    }

    await db.insert(diffusions).values({
        articleId,
        recipientCount: sent,
    });

    return { ok: true, count: sent };
}
