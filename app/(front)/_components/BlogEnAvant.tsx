import Link from 'next/link';
import Image from 'next/image';
import type { ArticleAvecExtrait } from '@/lib/queries/articles';
import type { CategorieBlog } from '@/lib/queries/categories-blog';

type CellProps = {
    article: ArticleAvecExtrait;
    categories: CategorieBlog[];
    large?: boolean;
};

function BentoCell({ article, categories, large = false }: CellProps) {
    const dateStr = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(article.publishedAt ?? article.createdAt));

    const meta = (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
            {article.auteurNom && (
                <span className="text-[10px] uppercase tracking-[0.1em] text-foreground font-medium">
                    {article.auteurNom}
                </span>
            )}
            <span className="text-[10px] text-muted">{dateStr}</span>
        </div>
    );

    const categoryLabel = categories.length > 0 && (
        <span className="text-[9px] uppercase tracking-[0.14em] text-primary">
            {categories[0].nom}
        </span>
    );

    const titleClass = `font-serif font-bold text-foreground leading-[1.15] group-hover:text-primary transition-colors ${large ? 'text-xl md:text-2xl' : 'text-base'}`;

    if (article.image) {
        return (
            <Link
                href={`/blog/${article.slug}`}
                className="group flex flex-col overflow-hidden bg-surface hover:shadow-[0_2px_16px_rgba(26,26,26,0.08)] transition-shadow duration-300 h-full"
            >
                <div
                    className={`relative overflow-hidden flex-shrink-0 ${large ? 'h-64 md:h-72' : 'h-44'}`}
                >
                    <Image
                        src={article.image}
                        alt={article.imageAlt ?? article.titre}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                    />
                </div>
                <div
                    className={`flex flex-col justify-between flex-1 ${large ? 'p-7' : 'p-5'}`}
                >
                    <div className="space-y-2.5">
                        {categoryLabel}
                        <h3 className={titleClass}>{article.titre}</h3>
                        {large && article.extrait && (
                            <p className="text-sm text-muted leading-[1.75] line-clamp-2 max-w-[44ch]">
                                {article.extrait}
                            </p>
                        )}
                    </div>
                    {meta}
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/blog/${article.slug}`}
            className="group flex flex-col justify-between bg-surface border border-border hover:border-primary/40 transition-colors duration-200 h-full"
        >
            <div className={`flex-1 ${large ? 'p-8' : 'p-6'} space-y-3`}>
                {categoryLabel}
                <h3 className={titleClass}>{article.titre}</h3>
                {large && article.extrait && (
                    <p className="text-sm text-muted leading-[1.75] line-clamp-3 max-w-[40ch]">
                        {article.extrait}
                    </p>
                )}
            </div>
            <div className={large ? 'px-8 pb-7' : 'px-6 pb-5'}>{meta}</div>
        </Link>
    );
}

export function BlogEnAvant({
    articles,
    categoriesMap,
}: {
    articles: ArticleAvecExtrait[];
    categoriesMap: Record<string, CategorieBlog[]>;
}) {
    if (articles.length === 0) return null;

    return (
        <section className="max-w-6xl mx-auto px-6 py-section space-y-8">
            <div className="flex items-end justify-between">
                <div className="space-y-1.5">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                        Chroniques
                    </p>
                    <h2 className="font-serif text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-foreground leading-[1.1] tracking-[-0.01em]">
                        Du côté de la plume
                    </h2>
                </div>
                <Link
                    href="/blog"
                    className="text-[11px] uppercase tracking-[0.1em] text-primary hover:text-foreground transition-colors"
                >
                    Voir tout
                </Link>
            </div>

            {articles.length === 1 && (
                <BentoCell
                    article={articles[0]}
                    categories={categoriesMap[articles[0].id] ?? []}
                    large
                />
            )}

            {articles.length === 2 && (
                <div className="grid md:grid-cols-[3fr_2fr] gap-px">
                    <BentoCell
                        article={articles[0]}
                        categories={categoriesMap[articles[0].id] ?? []}
                        large
                    />
                    <BentoCell
                        article={articles[1]}
                        categories={categoriesMap[articles[1].id] ?? []}
                    />
                </div>
            )}

            {articles.length === 3 && (
                <div className="grid md:grid-cols-[2fr_1fr] gap-px">
                    <BentoCell
                        article={articles[0]}
                        categories={categoriesMap[articles[0].id] ?? []}
                        large
                    />
                    <div className="grid grid-rows-2 gap-px">
                        <BentoCell
                            article={articles[1]}
                            categories={categoriesMap[articles[1].id] ?? []}
                        />
                        <BentoCell
                            article={articles[2]}
                            categories={categoriesMap[articles[2].id] ?? []}
                        />
                    </div>
                </div>
            )}

            {articles.length >= 4 && (
                <div className="grid md:grid-cols-3 gap-px">
                    <div className="md:col-span-2">
                        <BentoCell
                            article={articles[0]}
                            categories={categoriesMap[articles[0].id] ?? []}
                            large
                        />
                    </div>
                    <div className="grid grid-rows-2 gap-px">
                        <BentoCell
                            article={articles[1]}
                            categories={categoriesMap[articles[1].id] ?? []}
                        />
                        <BentoCell
                            article={articles[2]}
                            categories={categoriesMap[articles[2].id] ?? []}
                        />
                    </div>
                    {articles[3] && (
                        <div className="md:col-span-3">
                            <BentoCell
                                article={articles[3]}
                                categories={categoriesMap[articles[3].id] ?? []}
                            />
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
