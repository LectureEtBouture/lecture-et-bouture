import Link from 'next/link';
import { ArticleCoverBlock } from '../../_components/ArticleCoverBlock';
import type { ArticleItem } from '@/lib/queries/articles';

function ArticleLienCard({
    article,
    index,
}: {
    article: ArticleItem;
    index: number;
}) {
    const dateStr = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(article.publishedAt ?? article.createdAt));

    return (
        <Link
            href={`/blog/${article.slug}`}
            className="group flex gap-4 hover:bg-surface transition-colors p-3 -mx-3"
        >
            <ArticleCoverBlock
                image={article.image}
                imageAlt={article.imageAlt}
                titre={article.titre}
                index={index}
                className="w-20 h-20 flex-shrink-0"
            />
            <div className="min-w-0 space-y-1 py-1">
                <p className="text-sm font-serif font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {article.titre}
                </p>
                <p className="text-[11px] text-muted">{dateStr}</p>
            </div>
        </Link>
    );
}

export function ArticlesLiesSection({
    lies,
    parCategorie,
    articleId,
}: {
    lies: ArticleItem[];
    parCategorie: ArticleItem[];
    articleId: string;
}) {
    const lieIds = new Set(lies.map((article) => article.id));
    lieIds.add(articleId);
    const complement = parCategorie
        .filter((article) => !lieIds.has(article.id))
        .slice(0, 3);

    const tous = [...lies, ...complement];
    if (tous.length === 0) return null;

    return (
        <aside className="max-w-[72ch] mx-auto px-6 py-10 border-t border-border">
            <h2 className="text-[11px] uppercase tracking-[0.14em] text-muted mb-6">
                À lire aussi
            </h2>
            <div className="space-y-1">
                {tous.map((article, index) => (
                    <ArticleLienCard
                        key={article.id}
                        article={article}
                        index={index}
                    />
                ))}
            </div>
        </aside>
    );
}
