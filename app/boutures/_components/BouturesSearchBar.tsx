'use client';

import { SearchBar } from '@/components/ui/SearchBar';

interface Props {
    value: string;
}

export function BouturesSearchBar({ value }: Props) {
    return (
        <SearchBar
            value={value}
            route="/boutures"
            placeholder="Nom, espèce, famille…"
        />
    );
}
