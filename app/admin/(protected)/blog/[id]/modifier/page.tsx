import { notFound } from 'next/navigation';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { ArticlesLiesManager } from './_components/ArticlesLiesManager';
import { DiffusionWidget } from './_components/DiffusionWidget';
import { updateArticle } from '@/lib/actions/articles';
import {
    getArticleById,
    getArticlesAdmin,
    getArticlesLies,
    getCategoriesArticle,
} from '@/lib/queries/articles';
import { getCategoriesBlog } from '@/lib/queries/categories-blog';
import { getAuteursBlog } from '@/lib/queries/auteurs-blog';
import { getDiffusionForArticle, getSubscriberCount } from '@/lib/actions/diffusions';
import { getTagsBlog, getTagsArticle } from '@/lib/queries/tags-blog';

export default async function ModifierArticlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [
        article,
        categories,
        auteurs,
        lies,
        tousArticles,
        categoriesArticle,
        lastDiffusion,
        subscriberCount,
        tags,
        tagsArticle,
    ] = await Promise.all([
        getArticleById(id),
        getCategoriesBlog(),
        getAuteursBlog(),
        getArticlesLies(id),
        getArticlesAdmin(),
        getCategoriesArticle(id),
        getDiffusionForArticle(id),
        getSubscriberCount(),
        getTagsBlog(),
        getTagsArticle(id),
    ]);

    if (!article) notFound();

    const action = updateArticle.bind(null, id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier l&apos;article
            </h1>
            <ArticleForm
                action={action}
                auteurs={auteurs}
                categories={categories}
                tags={tags}
                defaultValues={{
                    titre: article.titre,
                    slug: article.slug,
                    auteurNom: article.auteurNom,
                    contenu: article.contenu,
                    image: article.image,
                    imageAlt: article.imageAlt,
                    publie: article.publie,
                    enAvant: article.enAvant,
                    categorieIds: categoriesArticle.map(
                        (categorie) => categorie.id,
                    ),
                    tagIds: tagsArticle.map((tag) => tag.id),
                }}
            />
            <ArticlesLiesManager
                articleId={id}
                lies={lies}
                tous={tousArticles}
            />
            {article.publie && (
                <DiffusionWidget
                    articleId={id}
                    articleTitre={article.titre}
                    subscriberCount={subscriberCount}
                    lastDiffusion={lastDiffusion}
                />
            )}
        </div>
    );
}
