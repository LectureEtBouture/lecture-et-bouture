import Link from 'next/link';

const chipCls =
    'text-[9px] uppercase tracking-[0.14em] text-primary border border-primary/30 px-2.5 py-1';

export function ArticleCategoriChips({
    categories,
    linked = true,
}: {
    categories: { id: string; nom: string; slug: string }[];
    linked?: boolean;
}) {
    if (categories.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((categorie) =>
                linked ? (
                    <Link
                        key={categorie.id}
                        href={`/blog?categorie=${categorie.slug}`}
                        className={`${chipCls} hover:border-primary transition-colors`}
                    >
                        {categorie.nom}
                    </Link>
                ) : (
                    <span key={categorie.id} className={chipCls}>
                        {categorie.nom}
                    </span>
                ),
            )}
        </div>
    );
}
