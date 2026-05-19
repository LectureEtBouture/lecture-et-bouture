'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { BoutureBentoGrid } from './BoutureBentoGrid';
import { loadMoreBoutures } from '@/lib/actions/boutures-publiques';
import type { BouturePublique } from '@/lib/queries/boutures';

const PAGE_SIZE = 10;

export function BoutureBentoInfinite({
    initialItems,
}: {
    initialItems: BouturePublique[];
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
        const next = await loadMoreBoutures(offsetRef.current);
        offsetRef.current += next.length;
        if (next.length < PAGE_SIZE) setHasMore(false);
        setItems((prev) => [...prev, ...next]);
        setLoading(false);
        loadingRef.current = false;
    }, [hasMore]);

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
            <BoutureBentoGrid boutures={items} />
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
