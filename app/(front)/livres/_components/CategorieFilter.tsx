'use client';

import { pill } from '@/components/ui/filter';

// Sujets Google Books mappés sur nos slugs bisac existants (bisac.ts)
const CATEGORIES = [
    { slug: 'litterature', label: 'Littérature' },
    { slug: 'imaginaire', label: 'Imaginaire' },
    { slug: 'policier-thriller', label: 'Policier & Thriller' },
    { slug: 'jeunesse', label: 'Jeunesse' },
    { slug: 'biographie', label: 'Biographie' },
    { slug: 'histoire', label: 'Histoire' },
    { slug: 'philosophie-essai', label: 'Philosophie' },
    { slug: 'bande-dessinee', label: 'Bande dessinée' },
    { slug: 'manga', label: 'Manga' },
    { slug: 'sciences-nature', label: 'Sciences & Nature' },
    { slug: 'cuisine-gastronomie', label: 'Cuisine' },
    { slug: 'voyage', label: 'Voyages' },
    { slug: 'art-beaux-livres', label: 'Art' },
    { slug: 'developpement-personnel', label: 'Développement perso' },
    { slug: 'poesie-theatre', label: 'Poésie & Théâtre' },
];

export function CategorieFilter({
    activeCat,
    push,
}: {
    activeCat?: string;
    push: (updates: Record<string, string | undefined>) => void;
}) {
    return (
        <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted">
                Parcourir par sujet
            </span>
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() =>
                            push({
                                cat:
                                    activeCat === cat.slug
                                        ? undefined
                                        : cat.slug,
                                rayon: undefined,
                                genre: undefined,
                                sort: undefined,
                                choix: undefined,
                            })
                        }
                        className={pill(activeCat === cat.slug)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
