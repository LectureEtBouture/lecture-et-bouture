import Link from 'next/link';
import Image from 'next/image';
import { ArticleCategoriChips } from '../../_components/ArticleCategoriChips';
import { ArticleTagChips } from '../../_components/ArticleTagChips';
import { GoBackButton } from './GoBackButton';
import type { CategorieBlog } from '@/lib/queries/categories-blog';
import type { TagBlog } from '@/lib/queries/tags-blog';

function formatDate(date: Date | string | null): string {
    if (!date) return '';
    return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date));
}

export function ArticleHeader({
    titre,
    auteurNom,
    publishedAt,
    createdAt,
    image,
    imageAlt,
    categories,
    tags,
}: {
    titre: string;
    auteurNom: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    image: string | null;
    imageAlt: string | null;
    categories: CategorieBlog[];
    tags: TagBlog[];
}) {
    const date = publishedAt ?? createdAt;

    return (
        <header>
            {image && (
                <div className="relative w-full overflow-hidden h-[clamp(280px,55vh,680px)]">
                    <Image
                        src={image}
                        alt={imageAlt ?? titre}
                        fill
                        className="object-cover object-center"
                        sizes="100vw"
                        priority
                    />
                </div>
            )}

            <div className="max-w-[72ch] mx-auto px-6 pt-8 pb-0 flex items-center justify-between gap-4">
                <ol className="flex items-center gap-2 text-[11px] text-muted min-w-0">
                    <li className="shrink-0">
                        <Link
                            href="/blog"
                            className="uppercase tracking-[0.1em] hover:text-primary transition-colors"
                        >
                            Blog
                        </Link>
                    </li>
                    <li
                        aria-hidden
                        className="text-border select-none shrink-0"
                    >
                        ·
                    </li>
                    <li className="text-foreground truncate uppercase tracking-[0.08em]">
                        {titre}
                    </li>
                </ol>
                <GoBackButton />
            </div>

            <div
                className={`max-w-[72ch] mx-auto px-6 pb-6 space-y-5 ${image ? 'pt-10' : 'pt-6'}`}
            >
                {(categories.length > 0 || tags.length > 0) && (
                    <div className="flex flex-wrap items-center gap-3">
                        <ArticleCategoriChips categories={categories} />
                        <ArticleTagChips tags={tags} />
                    </div>
                )}
                <div className="flex items-center gap-3 text-[11px] text-muted">
                    {auteurNom && (
                        <span className="uppercase tracking-[0.1em] text-foreground font-medium">
                            {auteurNom}
                        </span>
                    )}
                    <span>{formatDate(date)}</span>
                </div>
                <h1 className="font-serif text-[clamp(1.75rem,3.5vw,3rem)] font-bold text-foreground leading-[1.1] tracking-[-0.015em]">
                    {titre}
                </h1>
            </div>
        </header>
    );
}
