import Link from 'next/link';
import { getArticlesAdmin } from '@/lib/queries/articles';
import { ArticleRow } from './_components/ArticleRow';

export default async function AdminBlogPage() {
    const data = await getArticlesAdmin();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Blog
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} article{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/blog/categories"
                        className="px-4 py-2 border border-border text-foreground text-[11px] uppercase tracking-[0.1em] hover:border-primary transition-colors"
                    >
                        Catégories
                    </Link>
                    <Link
                        href="/admin/blog/auteurs"
                        className="px-4 py-2 border border-border text-foreground text-[11px] uppercase tracking-[0.1em] hover:border-primary transition-colors"
                    >
                        Auteurs
                    </Link>
                    <Link
                        href="/admin/blog/nouveau"
                        className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Nouvel article
                    </Link>
                </div>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucun article pour le moment.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Titre
                                </th>
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Date
                                </th>
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    État
                                </th>
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Avant
                                </th>
                                <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((article) => (
                                <ArticleRow
                                    key={article.id}
                                    article={article}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
