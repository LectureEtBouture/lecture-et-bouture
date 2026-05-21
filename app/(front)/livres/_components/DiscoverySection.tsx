'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LivreCard } from '@/components/ui/LivreCard';
import { loadMoreDiscovery } from '@/lib/actions/livres-publiques';
import type { LivreComplet } from '@/lib/services/books/types';

// Google Books always pages in 40-item chunks — track the API offset separately
// from the displayed item count so we never re-fetch an overlapping slice.
const API_PAGE_SIZE = 40;

type Genre = { id: string; nom: string };

export function DiscoverySection({
    titre,
    initialItems,
    type,
    genresList,
    showEbook = false,
}: {
    titre: string;
    initialItems: LivreComplet[];
    type: 'tendances' | 'nouveautes';
    genresList: Genre[];
    showEbook?: boolean;
}) {
    const [items, setItems] = useState<LivreComplet[]>(initialItems);
    const [loading, setLoading] = useState(false);
    // Assume more if the initial load had any items; set false when API returns empty.
    const [hasMore, setHasMore] = useState(initialItems.length > 0);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    // Start at API_PAGE_SIZE: the first batch was startIndex=0, so next is 40.
    const startIndexRef = useRef(API_PAGE_SIZE);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);
        const next = await loadMoreDiscovery(type, startIndexRef.current, showEbook);
        startIndexRef.current += API_PAGE_SIZE;
        if (next.length === 0) setHasMore(false);
        setItems((prev) => [...prev, ...next]);
        setLoading(false);
        loadingRef.current = false;
    }, [type, hasMore, showEbook]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) loadMore(); },
            { rootMargin: '400px' },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    if (items.length === 0) return null;

    return (
        <section className="space-y-6">
            <div className="flex items-baseline gap-4">
                <h2 className="font-serif text-xl font-bold text-foreground">{titre}</h2>
                <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((livre, i) => (
                    <LivreCard
                        key={`${livre.inventaireUri}-${i}`}
                        livre={livre}
                        featured={livre.choixLibrairie}
                        genreNom={genresList.find((genre) => genre.id === livre.genreIds?.[0])?.nom}
                    />
                ))}
            </div>
            <div
                ref={sentinelRef}
                aria-hidden="true"
                className="h-4"
            />
            {hasMore && (
                <div className="flex justify-center pt-2">
                    <button
                        type="button"
                        onClick={loadMore}
                        disabled={loading}
                        className="px-6 py-2 text-sm border border-border text-muted hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Chargement…' : 'Charger plus'}
                    </button>
                </div>
            )}
        </section>
    );
}
