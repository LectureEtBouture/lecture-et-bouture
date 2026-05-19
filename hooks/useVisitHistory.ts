'use client';

import { useEffect, useState } from 'react';

export type Visit = {
    type: 'livre' | 'bouture';
    slug: string;
    titre: string;
    auteur?: string;
    coverColor: string;
    image?: string;
    visitedAt: number;
};

const STORAGE_KEY = 'lb-visit-history';
const MAX_VISITS = 12;

function readHistory(): Visit[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as Visit[];
    } catch {
        return [];
    }
}

function writeHistory(visits: Visit[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
    } catch {
        // Quota exceeded — ignore
    }
}

export function addVisit(visit: Omit<Visit, 'visitedAt'>) {
    const history = readHistory().filter(
        (v) => !(v.type === visit.type && v.slug === visit.slug),
    );
    const next: Visit[] = [
        { ...visit, visitedAt: Date.now() },
        ...history,
    ].slice(0, MAX_VISITS);
    writeHistory(next);
}

export function useVisitHistory() {
    const [visits, setVisits] = useState<Visit[] | null>(null);

    useEffect(() => {
        // Sync from localStorage on mount — valid external system access
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setVisits(readHistory());
    }, []);

    return { visits: visits ?? [], mounted: visits !== null };
}
