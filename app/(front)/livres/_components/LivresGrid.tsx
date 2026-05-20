'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LivreCard } from '@/components/ui/LivreCard';
import { loadMoreLivres } from '@/lib/actions/livres-publiques';
import type { LivrePublique, LivresFilters } from '@/lib/queries/livres';

const PAGE_SIZE = 24;

type Genre = { id: string; nom: string };

export function LivresGrid({
    initialItems,
    filters,
    genresList,
}: {
    initialItems: LivrePublique[];
    filters: LivresFilters;
    genresList: Genre[];
}) {
    const [items, setItems] = useState(initialItems);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialItems.length === PAGE_SIZE);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    const offsetRef = useRef(initialItems.length);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);
        const next = await loadMoreLivres(filters, offsetRef.current);
        offsetRef.current += next.length;
        if (next.length < PAGE_SIZE) setHasMore(false);
        setItems((prev) => [...prev, ...next]);
        setLoading(false);
        loadingRef.current = false;
    }, [filters, hasMore]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) loadMore();
            },
            { rootMargin: '400px' },
        );
        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, loadMore]);

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map((livre) => (
                    <LivreCard
                        key={livre.id}
                        livre={livre}
                        genreNom={
                            genresList.find(
                                (genre) => genre.id === livre.genreIds?.[0],
                            )?.nom
                        }
                    />
                ))}
            </div>
            <div
                ref={sentinelRef}
                aria-hidden="true"
                className="h-16 flex items-center justify-center text-sm text-muted"
            >
                {loading && 'Chargement…'}
            </div>
        </>
    );
}
