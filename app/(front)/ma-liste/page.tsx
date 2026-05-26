'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useWishlist, type WishlistItem } from '@/hooks/useWishlist';
import { DisponibiliteBar } from './_components/DisponibiliteBar';

export default function MaListePage() {
    const { items, mounted, remove, clear } = useWishlist();
    const [selectedSlugs, setSelectedSlugs] = useState<Set<string>>(new Set());

    if (!mounted) return null;

    function toggleSelect(slug: string) {
        setSelectedSlugs((prev) => {
            const next = new Set(prev);
            if (next.has(slug)) next.delete(slug);
            else next.add(slug);
            return next;
        });
    }

    function clearSelection() {
        setSelectedSlugs(new Set());
    }

    const selectedItems = items.filter((item) => selectedSlugs.has(item.slug));

    return (
        <>
            <div className="max-w-6xl mx-auto px-6 py-16 pb-28 space-y-10">
                <div className="flex items-baseline gap-4">
                    <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">
                        Ma liste
                    </h1>
                    {items.length > 0 && (
                        <>
                            <span className="text-xs uppercase tracking-widest text-muted">
                                {items.length} titre
                                {items.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={clear}
                                className="ml-auto text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
                            >
                                Tout effacer
                            </button>
                        </>
                    )}
                </div>

                <p className="text-[11px] text-muted/70">
                    Cette liste est enregistrée dans ce navigateur uniquement.
                </p>

                {items.length === 0 ? (
                    <div className="pt-12 pb-20 space-y-4 border-t border-border text-center">
                        <p className="font-serif text-xl text-muted">
                            Votre liste est vide.
                        </p>
                        <Link
                            href="/livres"
                            className="text-sm text-muted underline hover:text-primary transition-colors"
                        >
                            Parcourir la sélection
                        </Link>
                    </div>
                ) : (
                    <>
                        <p className="text-xs text-foreground/60 -mt-4 flex items-center gap-2">
                            <span
                                className="inline-flex w-4 h-4 border border-border bg-background items-center justify-center shrink-0"
                                aria-hidden="true"
                            />
                            Cochez les livres pour demander leur disponibilité
                            en boutique.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-4 border-t border-border">
                            {items.map((item) => (
                                <WishlistCard
                                    key={item.slug}
                                    item={item}
                                    isSelected={selectedSlugs.has(item.slug)}
                                    onToggleSelect={() =>
                                        toggleSelect(item.slug)
                                    }
                                    onRemove={() => remove(item.slug)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            <DisponibiliteBar
                selected={selectedItems}
                onClear={clearSelection}
            />
        </>
    );
}

function WishlistCard({
    item,
    isSelected,
    onToggleSelect,
    onRemove,
}: {
    item: WishlistItem;
    isSelected: boolean;
    onToggleSelect: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="group/card relative">
            <Link href={`/livres/${item.slug}`} className="group block">
                <div
                    className="aspect-book w-full relative overflow-hidden"
                    style={{ backgroundColor: item.coverColor }}
                >
                    {item.image && (
                        <Image
                            src={item.image}
                            alt={item.titre}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    )}
                </div>
                <div className="pt-3 space-y-1">
                    <h3 className="font-serif text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.titre}
                    </h3>
                    {item.auteur && (
                        <p className="text-xs text-muted">{item.auteur}</p>
                    )}
                </div>
            </Link>

            {/* Checkbox sélection disponibilité */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    onToggleSelect();
                }}
                aria-label={
                    isSelected
                        ? 'Désélectionner pour la demande de disponibilité'
                        : 'Sélectionner pour la demande de disponibilité'
                }
                className={`absolute top-2 left-2 w-6 h-6 border transition-all z-10 flex items-center justify-center cursor-pointer ${
                    isSelected
                        ? 'bg-primary border-primary text-background opacity-100'
                        : 'bg-background/80 border-border text-transparent opacity-40 group-hover/card:opacity-100 hover:border-primary'
                }`}
            >
                {isSelected && (
                    <svg
                        width="10"
                        height="8"
                        viewBox="0 0 10 8"
                        fill="none"
                        aria-hidden="true"
                    >
                        <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                )}
            </button>

            {/* Bouton retirer de la liste */}
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 w-6 h-6 bg-background/90 text-muted hover:text-foreground flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity text-sm leading-none"
                aria-label={`Retirer ${item.titre} de ma liste`}
            >
                ×
            </button>
        </div>
    );
}
