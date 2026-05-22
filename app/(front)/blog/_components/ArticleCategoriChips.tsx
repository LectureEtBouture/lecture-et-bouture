import Link from 'next/link';

export function ArticleCategoriChips({
    categories,
}: {
    categories: { id: string; nom: string; slug: string }[];
}) {
    if (categories.length === 0) return null;
    return (
        <div className="flex flex-wrap gap-2">
            {categories.map((categorie) => (
                <Link
                    key={categorie.id}
                    href={`/blog?categorie=${categorie.slug}`}
                    className="text-[9px] uppercase tracking-[0.14em] text-primary border border-primary/30 px-2.5 py-1 hover:border-primary transition-colors"
                >
                    {categorie.nom}
                </Link>
            ))}
        </div>
    );
}
