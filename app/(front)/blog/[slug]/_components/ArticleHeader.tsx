import Image from 'next/image';
import { ArticleCategoriChips } from '../../_components/ArticleCategoriChips';
import type { CategorieBlog } from '@/lib/queries/categories-blog';

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
}: {
    titre: string;
    auteurNom: string | null;
    publishedAt: Date | null;
    createdAt: Date;
    image: string | null;
    imageAlt: string | null;
    categories: CategorieBlog[];
}) {
    const date = publishedAt ?? createdAt;

    return (
        <header>
            {image && (
                <div className="relative w-full h-[40vh] min-h-[260px] max-h-[520px] overflow-hidden">
                    <Image
                        src={image}
                        alt={imageAlt ?? titre}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                    />
                </div>
            )}
            <div
                className={`max-w-[72ch] mx-auto px-6 pb-6 space-y-5 ${image ? 'pt-12' : 'pt-16'}`}
            >
                <ArticleCategoriChips categories={categories} />
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
