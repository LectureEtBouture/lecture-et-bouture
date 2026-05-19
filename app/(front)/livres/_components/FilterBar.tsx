'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import type { SortLivres } from '@/lib/queries/livres';
import type { GenreFacette, RayonFacette } from '@/lib/queries/livres-facets';
import { RayonFilter } from './RayonFilter';
import { GenreFilter } from './GenreFilter';
import { LivresDropdownFilters } from './LivresDropdownFilters';
import { LivresActiveFilters } from './LivresActiveFilters';

interface Props {
    rayons: RayonFacette[];
    genres: GenreFacette[];
    series: string[];
    editeurs: string[];
    formats: string[];
    activeRayonId?: number;
    activeGenreId?: number;
    activeSerie?: string;
    activeEditeur?: string;
    activeFormat?: string;
    activeSort?: SortLivres;
    activeChoixLibrairie?: boolean;
}

export function FilterBar({
    rayons,
    genres,
    series,
    editeurs,
    formats,
    activeRayonId,
    activeGenreId,
    activeSerie,
    activeEditeur,
    activeFormat,
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
            router.push(`/livres${str ? `?${str}` : ''}`);
        },
        [router, searchParams],
    );

    return (
        <div className="space-y-5">
            <RayonFilter
                rayons={rayons}
                activeRayonId={activeRayonId}
                push={push}
            />
            <GenreFilter
                genres={genres}
                activeGenreId={activeGenreId}
                activeChoixLibrairie={activeChoixLibrairie}
                push={push}
            />
            <LivresDropdownFilters
                series={series}
                editeurs={editeurs}
                formats={formats}
                activeSerie={activeSerie}
                activeEditeur={activeEditeur}
                activeFormat={activeFormat}
                activeSort={activeSort}
                push={push}
            />
            <LivresActiveFilters
                rayons={rayons}
                genres={genres}
                activeRayonId={activeRayonId}
                activeGenreId={activeGenreId}
                activeSerie={activeSerie}
                activeEditeur={activeEditeur}
                activeFormat={activeFormat}
                activeChoixLibrairie={activeChoixLibrairie}
                push={push}
                onReset={() => router.push('/livres')}
            />
        </div>
    );
}
