import Link from 'next/link';
import Image from 'next/image';
import type { ArticleItem } from '@/lib/queries/articles';
import type { CategorieBlog } from '@/lib/queries/categories-blog';
import { extraireTexte } from '@/lib/extrait';
import { ArticleCategoriChips } from './ArticleCategoriChips';

function formatDate(date: Date | string | null): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

export function ArticleLede({
    article,
    categories,
}: {
    article: ArticleItem;
    categories: CategorieBlog[];
}) {
    const extrait =
        extraireTexte(article.contenu ?? '', 280) || 'Lire cet article';
    const date = article.publishedAt ?? article.createdAt;

    if (article.image) {
        return (
            <Link href={`/blog/${article.slug}`} className="group block">
                <div className="grid md:grid-cols-[1fr_1fr] gap-0 min-h-[420px]">
                    <div className="relative min-h-[280px] md:min-h-0 overflow-hidden">
                        <Image
                            src={article.image}
                            alt={article.imageAlt ?? article.titre}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>
                    <div className="bg-surface flex flex-col justify-between p-10 lg:p-14">
                        <div className="space-y-5">
                            <ArticleCategoriChips categories={categories} />
                            <h2 className="font-serif text-[clamp(1.5rem,2.5vw,2.25rem)] font-bold text-foreground leading-[1.1] tracking-[-0.01em] group-hover:text-primary transition-colors">
                                {article.titre}
                            </h2>
                            <p className="text-sm text-muted leading-[1.8] max-w-[52ch]">
                                {extrait}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
                            {article.auteurNom && (
                                <span className="text-[11px] uppercase tracking-[0.1em] text-foreground font-medium">
                                    {article.auteurNom}
                                </span>
                            )}
                            <span className="text-[11px] text-muted">
                                {formatDate(date)}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/blog/${article.slug}`}
            className="group block bg-surface py-14 px-10 lg:px-16"
        >
            <div className="max-w-[64ch] space-y-6">
                <ArticleCategoriChips categories={categories} />
                <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em] group-hover:text-primary transition-colors">
                    {article.titre}
                </h2>
                <p className="text-base text-muted leading-[1.8] max-w-[56ch]">
                    {extrait}
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                    {article.auteurNom && (
                        <span className="text-[11px] uppercase tracking-[0.1em] text-foreground font-medium">
                            {article.auteurNom}
                        </span>
                    )}
                    <span className="text-[11px] text-muted">
                        {formatDate(date)}
                    </span>
                </div>
            </div>
        </Link>
    );
}

export function ArticleRow({
    article,
    categories,
    index,
}: {
    article: ArticleItem;
    categories: CategorieBlog[];
    index: number;
}) {
    const extrait =
        extraireTexte(article.contenu ?? '', 180) || 'Lire cet article';
    const date = article.publishedAt ?? article.createdAt;

    if (article.image) {
        const imageLeft = index % 2 === 0;
        const cover = (
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[240px] overflow-hidden">
                <Image
                    src={article.image}
                    alt={article.imageAlt ?? article.titre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                />
            </div>
        );
        const content = (
            <div className="flex flex-col justify-center p-8 lg:p-10 space-y-4">
                <ArticleCategoriChips categories={categories} />
                <h2 className="font-serif text-xl lg:text-2xl font-bold text-foreground leading-[1.15] group-hover:text-primary transition-colors">
                    {article.titre}
                </h2>
                <p className="text-sm text-muted leading-[1.75] max-w-[46ch] line-clamp-3">
                    {extrait}
                </p>
                <div className="flex items-center gap-3 pt-2">
                    {article.auteurNom && (
                        <span className="text-[11px] uppercase tracking-[0.1em] text-foreground font-medium">
                            {article.auteurNom}
                        </span>
                    )}
                    <span className="text-[11px] text-muted">
                        {formatDate(date)}
                    </span>
                </div>
            </div>
        );
        return (
            <Link
                href={`/blog/${article.slug}`}
                className="group grid md:grid-cols-2 bg-surface hover:shadow-[0_2px_12px_rgba(26,26,26,0.06)] transition-shadow duration-200"
            >
                {imageLeft ? cover : content}
                {imageLeft ? content : cover}
            </Link>
        );
    }

    return (
        <Link
            href={`/blog/${article.slug}`}
            className="group grid md:grid-cols-[3fr_2fr] bg-surface hover:bg-surface/60 transition-colors"
        >
            <div className="py-8 px-8 lg:px-10 space-y-3">
                <ArticleCategoriChips categories={categories} />
                <h2 className="font-serif text-lg lg:text-xl font-bold text-foreground leading-[1.2] group-hover:text-primary transition-colors">
                    {article.titre}
                </h2>
            </div>
            <div className="py-8 px-6 flex flex-col justify-between md:border-l border-border">
                <p className="text-sm text-muted leading-[1.75] line-clamp-3">
                    {extrait}
                </p>
                <div className="flex items-center gap-2 mt-4">
                    {article.auteurNom && (
                        <span className="text-[10px] uppercase tracking-[0.1em] text-foreground font-medium">
                            {article.auteurNom}
                        </span>
                    )}
                    <span className="text-[10px] text-muted">
                        {formatDate(date)}
                    </span>
                </div>
            </div>
        </Link>
    );
}
