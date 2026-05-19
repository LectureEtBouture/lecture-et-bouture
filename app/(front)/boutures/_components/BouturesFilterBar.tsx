'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { SortBoutures } from '@/lib/queries/boutures';
import { BoutureDifficulteFilter } from './BoutureDifficulteFilter';
import { BouturesDropdownFilters } from './BouturesDropdownFilters';
import { BouturesActiveFilters } from './BouturesActiveFilters';

interface Props {
    activeDifficulte?: string;
    activeLumiere?: string;
    activeArrosage?: string;
    activeSort?: SortBoutures;
    activeChoixLibrairie?: boolean;
}

export function BouturesFilterBar({
    activeDifficulte,
    activeLumiere,
    activeArrosage,
    activeSort,
    activeChoixLibrairie,
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const push = useCallback(
        (updates: Record<string, string | undefined>) => {
            const next = new URLSearchParams(searchParams.toString());
            for (const [key, value] of Object.entries(updates)) {
                if (value === undefined || value === '') next.delete(key);
                else next.set(key, value);
            }
            const str = next.toString();
            router.push(`/boutures${str ? `?${str}` : ''}`);
        },
        [router, searchParams],
    );

    return (
        <div className="space-y-5">
            <BoutureDifficulteFilter
                activeDifficulte={activeDifficulte}
                activeChoixLibrairie={activeChoixLibrairie}
                push={push}
            />
            <BouturesDropdownFilters
                activeLumiere={activeLumiere}
                activeArrosage={activeArrosage}
                activeSort={activeSort}
                push={push}
            />
            <BouturesActiveFilters
                activeDifficulte={activeDifficulte}
                activeLumiere={activeLumiere}
                activeArrosage={activeArrosage}
                activeChoixLibrairie={activeChoixLibrairie}
                push={push}
                onReset={() => router.push('/boutures')}
            />
        </div>
    );
}
