import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanitizeRte } from '@/lib/sanitize';
import { extraireTexte } from '@/lib/extrait';
import {
    getArticleBySlug,
    getArticlesLies,
    getArticlesParCategorie,
    getCategoriesArticle,
} from '@/lib/queries/articles';
import { getTagsArticle } from '@/lib/queries/tags-blog';
import { getAvisForArticle } from '@/lib/db/avis';
import { ArticleHeader } from './_components/ArticleHeader';
import { ArticlesLiesSection } from './_components/ArticlesLiesSection';
import { AvisArticleSection } from '@/components/ui/AvisArticleSection';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article) return {};
    return {
        title: article.titre,
        description: extraireTexte(article.contenu ?? '', 160),
        openGraph: article.image ? { images: [article.image] } : undefined,
    };
}

export default async function ArticlePage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const article = await getArticleBySlug(slug);
    if (!article || !article.publie) notFound();

    const [categories, tags, avis, lies] = await Promise.all([
        getCategoriesArticle(article.id),
        getTagsArticle(article.id),
        getAvisForArticle(article.id),
        getArticlesLies(article.id),
    ]);

    const parCategorie =
        categories.length > 0
            ? await getArticlesParCategorie(categories[0].id)
            : [];

    // Content sanitized server-side via sanitizeRte (sanitize-html) before rendering
    const safeHtml = article.contenu ? sanitizeRte(article.contenu) : null;

    return (
        <article>
            <ArticleHeader
                titre={article.titre}
                auteurNom={article.auteurNom}
                publishedAt={article.publishedAt}
                createdAt={article.createdAt}
                image={article.image}
                imageAlt={article.imageAlt}
                categories={categories}
                tags={tags}
            />

            {safeHtml && (
                // sanitizeRte strips all disallowed tags/attrs; safe to render
                <div
                    className="prose max-w-[72ch] mx-auto px-6 py-10"
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
            )}

            <ArticlesLiesSection
                lies={lies}
                parCategorie={parCategorie}
                articleId={article.id}
            />

            <div className="max-w-[72ch] mx-auto px-6 mb-4">
                <AvisArticleSection avis={avis} articleId={article.id} />
            </div>
        </article>
    );
}
