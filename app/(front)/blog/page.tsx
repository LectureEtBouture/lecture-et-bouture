import type { Metadata } from 'next';
import {
    getArticles,
    getCategoriesParArticles,
    type ArticlesSort,
} from '@/lib/queries/articles';
import { getCategoriesBlog } from '@/lib/queries/categories-blog';
import { ArticleLede, ArticleRow } from './_components/ArticleListingRow';
import { BlogFiltres } from './_components/BlogFiltres';

export const metadata: Metadata = {
    title: 'Blog',
    description:
        'Réflexions sur les livres, les plantes, et ce qui pousse lentement.',
};

const VALID_SORTS: ArticlesSort[] = ['recents', 'anciens', 'alpha'];

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ categorie?: string; sort?: string }>;
}) {
    const { categorie, sort: sortParam } = await searchParams;
    const sort: ArticlesSort = VALID_SORTS.includes(sortParam as ArticlesSort)
        ? (sortParam as ArticlesSort)
        : 'recents';

    const [articlesList, categories] = await Promise.all([
        getArticles(categorie, sort),
        getCategoriesBlog(),
    ]);

    const categoriesMap = await getCategoriesParArticles(
        articlesList.map((article) => article.id),
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-section">
            <header className="space-y-4 mb-2">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Chroniques
                </p>
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                    Blog
                </h1>
                <p className="text-base text-muted leading-[1.75] max-w-[52ch]">
                    Réflexions sur les livres, les plantes, et ce qui pousse
                    lentement.
                </p>
            </header>

            <BlogFiltres
                categories={categories}
                categorieActive={categorie}
                sortActive={sort}
            />

            {articlesList.length === 0 ? (
                <p className="text-sm text-muted py-16 text-center">
                    {categorie
                        ? 'Aucun article dans cette catégorie.'
                        : 'Les premières chroniques arrivent bientôt.'}
                </p>
            ) : (
                <div className="space-y-10 md:space-y-14 mt-8">
                    {articlesList.map((article, index) =>
                        index === 0 ? (
                            <ArticleLede
                                key={article.id}
                                article={article}
                                categories={categoriesMap[article.id] ?? []}
                            />
                        ) : (
                            <ArticleRow
                                key={article.id}
                                article={article}
                                categories={categoriesMap[article.id] ?? []}
                                index={index - 1}
                            />
                        ),
                    )}
                </div>
            )}
        </div>
    );
}
