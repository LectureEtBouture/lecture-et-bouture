import Link from 'next/link';

const chipCls =
    'text-[9px] uppercase tracking-[0.12em] text-muted border border-border/60 px-2 py-0.5';

export function ArticleTagChips({
    tags,
    linked = true,
}: {
    tags: { id: string; nom: string; slug: string }[];
    linked?: boolean;
}) {
    if (tags.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) =>
                linked ? (
                    <Link
                        key={tag.id}
                        href={`/blog?tag=${tag.slug}`}
                        className={`${chipCls} hover:border-primary hover:text-primary transition-colors`}
                    >
                        #{tag.nom}
                    </Link>
                ) : (
                    <span key={tag.id} className={chipCls}>
                        #{tag.nom}
                    </span>
                ),
            )}
        </div>
    );
}
