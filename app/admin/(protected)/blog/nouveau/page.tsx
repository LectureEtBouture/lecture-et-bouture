import { ArticleForm } from '@/components/admin/ArticleForm';
import { createArticle } from '@/lib/actions/articles';
import { getCategoriesBlog } from '@/lib/queries/categories-blog';
import { getAuteursBlog } from '@/lib/queries/auteurs-blog';

export default async function NouvelArticlePage() {
    const [categories, auteurs] = await Promise.all([
        getCategoriesBlog(),
        getAuteursBlog(),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouvel article
            </h1>
            <ArticleForm
                action={createArticle}
                auteurs={auteurs}
                categories={categories}
            />
        </div>
    );
}
