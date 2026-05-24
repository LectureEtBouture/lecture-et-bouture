'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { LivreCard } from '@/components/ui/LivreCard';
import { loadMoreLivres } from '@/lib/actions/livres-publiques';
import type { LivreComplet, LivresFilters } from '@/lib/queries/livres';

type Genre = { id: string; nom: string };

// Google Books always pages in 40-item chunks.
// For cat browse, the offset must be a multiple of 40 regardless of how many
// items survived the ebook filter — otherwise we'd re-fetch an overlapping slice.
const API_PAGE_SIZE = 40;

export function LivresGrid({
    initialItems,
    rawInitialCount,
    filters,
    genresList,
    pageSize,
}: {
    initialItems: LivreComplet[];
    rawInitialCount?: number;
    filters: LivresFilters;
    genresList: Genre[];
    pageSize: number;
}) {
    const isCat = !!filters.cat;
    const [items, setItems] = useState<LivreComplet[]>(initialItems);
    const [loading, setLoading] = useState(false);
    // Cat browse: use raw count (before ebook filter) to avoid phantom extra request.
    // Regular browse: hasMore only if we filled the page exactly.
    const [hasMore, setHasMore] = useState(
        isCat
            ? (rawInitialCount ?? initialItems.length) >= API_PAGE_SIZE
            : initialItems.length === pageSize,
    );
    const sentinelRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef(false);
    // For cat browse, always step by API_PAGE_SIZE to avoid overlapping slices.
    const offsetRef = useRef(isCat ? API_PAGE_SIZE : initialItems.length);

    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;
        loadingRef.current = true;
        setLoading(true);
        const next = await loadMoreLivres(filters, offsetRef.current);
        offsetRef.current += isCat ? API_PAGE_SIZE : next.length;
        if (next.length === 0 || (!isCat && next.length < pageSize))
            setHasMore(false);
        setItems((prev) => [...prev, ...next]);
        setLoading(false);
        loadingRef.current = false;
    }, [filters, hasMore, pageSize, isCat]);

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
                {items.map((livre, i) => (
                    <LivreCard
                        key={`${livre.inventaireUri}-${i}`}
                        livre={livre}
                        genreNom={
                            genresList.find(
                                (genre) => genre.id === livre.genreIds?.[0],
                            )?.nom
                        }
                    />
                ))}
            </div>
            <div ref={sentinelRef} aria-hidden="true" className="h-4" />
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
        </>
    );
}
