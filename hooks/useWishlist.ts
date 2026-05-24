'use client';

import { useEffect, useState } from 'react';

export type WishlistItem = {
    slug: string;
    titre: string;
    auteur?: string;
    coverColor: string;
    image?: string;
    addedAt: number;
};

const STORAGE_KEY = 'lb-wishlist';
const CHANGE_EVENT = 'lb-wishlist-change';

function readWishlist(): WishlistItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as WishlistItem[];
    } catch {
        return [];
    }
}

function writeWishlist(items: WishlistItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
    } catch {
        // Quota exceeded — ignore
    }
}

export function useWishlist() {
    const [items, setItems] = useState<WishlistItem[] | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(readWishlist());

        function onExternalChange() {
            setItems(readWishlist());
        }
        window.addEventListener(CHANGE_EVENT, onExternalChange);
        return () => window.removeEventListener(CHANGE_EVENT, onExternalChange);
    }, []);

    function toggle(item: Omit<WishlistItem, 'addedAt'>) {
        const current = readWishlist();
        const exists = current.some((w) => w.slug === item.slug);
        writeWishlist(
            exists
                ? current.filter((w) => w.slug !== item.slug)
                : [{ ...item, addedAt: Date.now() }, ...current],
        );
        setItems(readWishlist());
    }

    function remove(slug: string) {
        writeWishlist(readWishlist().filter((w) => w.slug !== slug));
        setItems(readWishlist());
    }

    function clear() {
        writeWishlist([]);
        setItems([]);
    }

    function has(slug: string) {
        return (items ?? []).some((w) => w.slug === slug);
    }

    return {
        items: items ?? [],
        mounted: items !== null,
        toggle,
        remove,
        clear,
        has,
    };
}
