import Link from 'next/link';
import { getArticlesAdmin } from '@/lib/queries/articles';
import { getTagsBlog } from '@/lib/queries/tags-blog';
import { getCategoriesBlog } from '@/lib/queries/categories-blog';
import { getAuteursBlog } from '@/lib/queries/auteurs-blog';
import { ArticleRow } from './_components/ArticleRow';
import { CreatedToast } from './_components/CreatedToast';

export default async function AdminBlogPage({
    searchParams,
}: {
    searchParams: Promise<{ tag?: string }>;
}) {
    const { tag } = await searchParams;
    const [data, tags, categories, auteurs] = await Promise.all([
        getArticlesAdmin(tag),
        getTagsBlog(),
        getCategoriesBlog(),
        getAuteursBlog(),
    ]);

    return (
        <div className="space-y-6">
            <CreatedToast />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Blog
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} article{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/blog/tags"
                        className="flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[11px] uppercase tracking-[0.1em] hover:border-primary transition-colors"
                    >
                        Tags
                        {tags.length > 0 && (
                            <span className="text-[10px] tabular-nums text-muted font-normal normal-case tracking-normal leading-none">
                                {tags.length}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/admin/blog/categories"
                        className="flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[11px] uppercase tracking-[0.1em] hover:border-primary transition-colors"
                    >
                        Catégories
                        {categories.length > 0 && (
                            <span className="text-[10px] tabular-nums text-muted font-normal normal-case tracking-normal leading-none">
                                {categories.length}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/admin/blog/auteurs"
                        className="flex items-center gap-2 px-3 py-2 border border-border text-foreground text-[11px] uppercase tracking-[0.1em] hover:border-primary transition-colors"
                    >
                        Auteurs
                        {auteurs.length > 0 && (
                            <span className="text-[10px] tabular-nums text-muted font-normal normal-case tracking-normal leading-none">
                                {auteurs.length}
                            </span>
                        )}
                    </Link>
                    <Link
                        href="/admin/blog/nouveau"
                        className="px-3 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Nouvel article
                    </Link>
                </div>
            </div>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="/admin/blog"
                        className={`text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 border transition-colors ${!tag ? 'border-primary bg-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`}
                    >
                        Tous
                    </Link>
                    {tags.map((t) => (
                        <Link
                            key={t.id}
                            href={`/admin/blog?tag=${t.slug}`}
                            className={`text-[10px] uppercase tracking-[0.1em] px-2.5 py-1 border transition-colors ${tag === t.slug ? 'border-primary bg-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`}
                        >
                            {t.nom}
                        </Link>
                    ))}
                </div>
            )}

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
