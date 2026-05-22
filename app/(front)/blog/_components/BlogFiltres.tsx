import Link from 'next/link';
import type { CategorieBlog } from '@/lib/queries/categories-blog';
import type { ArticlesSort } from '@/lib/queries/articles';

const SORTS: { value: ArticlesSort; label: string }[] = [
    { value: 'recents', label: 'Plus récents' },
    { value: 'anciens', label: 'Plus anciens' },
    { value: 'alpha', label: 'A–Z' },
];

function buildUrl(
    base: { categorie?: string; sort?: string },
    patch: { categorie?: string | null; sort?: string },
): string {
    const params = new URLSearchParams();
    const cat =
        patch.categorie !== undefined ? patch.categorie : base.categorie;
    const s = patch.sort ?? base.sort;
    if (cat) params.set('categorie', cat);
    if (s && s !== 'recents') params.set('sort', s);
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ''}`;
}

export function BlogFiltres({
    categories,
    categorieActive,
    sortActive,
}: {
    categories: CategorieBlog[];
    categorieActive?: string;
    sortActive: ArticlesSort;
}) {
    if (categories.length === 0) return null;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pt-6 pb-2">
            <div className="flex flex-wrap gap-2">
                <Link
                    href={buildUrl(
                        {
                            categorie: undefined,
                            sort:
                                sortActive !== 'recents'
                                    ? sortActive
                                    : undefined,
                        },
                        { categorie: null },
                    )}
                    className={`text-[10px] uppercase tracking-[0.12em] px-3 py-1.5 border transition-colors ${
                        !categorieActive
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
                            {
                                categorie: categorieActive,
                                sort:
                                    sortActive !== 'recents'
                                        ? sortActive
                                        : undefined,
                            },
                            { categorie: categorie.slug },
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

            <div className="flex gap-2 sm:ml-auto">
                {SORTS.map((option) => (
                    <Link
                        key={option.value}
                        href={buildUrl(
                            { categorie: categorieActive, sort: sortActive },
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
