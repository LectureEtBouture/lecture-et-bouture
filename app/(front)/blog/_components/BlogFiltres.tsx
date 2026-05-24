import Link from 'next/link';
import type { CategorieBlog } from '@/lib/queries/categories-blog';
import type { TagBlog } from '@/lib/queries/tags-blog';
import type { ArticlesSort } from '@/lib/queries/articles';

const SORTS: { value: ArticlesSort; label: string }[] = [
    { value: 'recents', label: 'Plus récents' },
    { value: 'anciens', label: 'Plus anciens' },
    { value: 'alpha', label: 'A–Z' },
];

function buildUrl(
    base: { categorie?: string; sort?: string; tag?: string },
    patch: { categorie?: string | null; sort?: string; tag?: string | null },
): string {
    const params = new URLSearchParams();
    const cat =
        patch.categorie !== undefined ? patch.categorie : base.categorie;
    const tag = patch.tag !== undefined ? patch.tag : base.tag;
    const s = patch.sort ?? base.sort;
    if (cat) params.set('categorie', cat);
    if (tag) params.set('tag', tag);
    if (s && s !== 'recents') params.set('sort', s);
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ''}`;
}

export function BlogFiltres({
    categories,
    tags,
    categorieActive,
    tagActive,
    sortActive,
}: {
    categories: CategorieBlog[];
    tags: TagBlog[];
    categorieActive?: string;
    tagActive?: string;
    sortActive: ArticlesSort;
}) {
    if (categories.length === 0 && tags.length === 0) return null;

    const sortBase = sortActive !== 'recents' ? sortActive : undefined;

    return (
        <div className="flex flex-col gap-3 pt-6 pb-2">
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={buildUrl({ sort: sortBase }, { categorie: null, tag: null })}
                        className={`text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 border transition-colors ${
                            !categorieActive && !tagActive
                                ? 'border-primary bg-primary text-background'
                                : 'border-border text-muted hover:border-primary hover:text-primary'
                        }`}
                    >
                        Toutes
                    </Link>
                    {categories.map((categorie) => (
                        <Link
                            key={categorie.id}
                            href={buildUrl(
                                { sort: sortBase },
                                { categorie: categorie.slug, tag: null },
                            )}
                            className={`text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 border transition-colors ${
                                categorieActive === categorie.slug
                                    ? 'border-primary bg-primary text-background'
                                    : 'border-border text-muted hover:border-primary hover:text-primary'
                            }`}
                        >
                            {categorie.nom}
                        </Link>
                    ))}
                </div>
            )}

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Link
                            key={tag.id}
                            href={buildUrl(
                                { sort: sortBase },
                                { tag: tag.slug, categorie: null },
                            )}
                            className={`text-[9px] uppercase tracking-[0.12em] px-2.5 py-1 border transition-colors ${
                                tagActive === tag.slug
                                    ? 'border-primary bg-primary text-background'
                                    : 'border-border/60 text-muted hover:border-primary hover:text-primary'
                            }`}
                        >
                            #{tag.nom}
                        </Link>
                    ))}
                </div>
            )}

            <div className="flex gap-2 self-end">
                {SORTS.map((option) => (
                    <Link
                        key={option.value}
                        href={buildUrl(
                            { categorie: categorieActive, tag: tagActive, sort: sortActive },
                            { sort: option.value },
                        )}
                        className={`text-[10px] uppercase tracking-[0.1em] px-2.5 py-1.5 transition-colors ${
                            sortActive === option.value
                                ? 'text-primary font-medium'
                                : 'text-muted hover:text-foreground'
                        }`}
                    >
                        {option.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
