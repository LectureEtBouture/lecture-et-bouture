'use client';

import { useWishlist, type WishlistItem } from '@/hooks/useWishlist';

type Props = Omit<WishlistItem, 'addedAt'>;

export function WishlistButton({
    slug,
    titre,
    auteur,
    coverColor,
    image,
}: Props) {
    const { has, toggle, mounted } = useWishlist();

    if (!mounted) return null;

    const saved = has(slug);

    return (
        <button
            type="button"
            onClick={() => toggle({ slug, titre, auteur, coverColor, image })}
            aria-label={saved ? 'Retirer de ma liste' : 'Ajouter à ma liste'}
            className={`flex items-center gap-2 text-xs uppercase tracking-[0.1em] border px-4 py-2.5 transition-colors ${
                saved
                    ? 'border-primary text-primary'
                    : 'border-border text-muted hover:border-primary hover:text-primary'
            }`}
        >
            <HeartIcon filled={saved} />
            {saved ? 'Sauvegardé' : 'Sauvegarder'}
        </button>
    );
}

function HeartIcon({ filled }: { filled: boolean }) {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M6.5 11.5C6.5 11.5 1 7.8 1 4.2C1 2.43 2.43 1 4.2 1C5.15 1 6 1.46 6.5 2.1C7 1.46 7.85 1 8.8 1C10.57 1 12 2.43 12 4.2C12 7.8 6.5 11.5 6.5 11.5Z"
                fill={filled ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
