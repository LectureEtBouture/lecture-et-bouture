import { notFound } from 'next/navigation';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { ArticlesLiesManager } from './_components/ArticlesLiesManager';
import { updateArticle } from '@/lib/actions/articles';
import { getArticleById, getArticlesAdmin, getArticlesLies, getCategoriesArticle } from '@/lib/queries/articles';
import { getCategoriesBlog } from '@/lib/queries/categories-blog';
import { getAuteursBlog } from '@/lib/queries/auteurs-blog';

export default async function ModifierArticlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const [article, categories, auteurs, lies, tousArticles, categoriesArticle] =
        await Promise.all([
            getArticleById(id),
            getCategoriesBlog(),
            getAuteursBlog(),
            getArticlesLies(id),
            getArticlesAdmin(),
            getCategoriesArticle(id),
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
                defaultValues={{
                    titre: article.titre,
                    slug: article.slug,
                    auteurNom: article.auteurNom,
                    contenu: article.contenu,
                    image: article.image,
                    imageAlt: article.imageAlt,
                    publie: article.publie,
                    enAvant: article.enAvant,
                    categorieIds: categoriesArticle.map((categorie) => categorie.id),
                }}
            />
            <ArticlesLiesManager
                articleId={id}
                lies={lies}
                tous={tousArticles}
            />
        </div>
    );
}
