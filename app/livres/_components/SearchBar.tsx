'use client';

import { SearchBar as SharedSearchBar } from '@/components/ui/SearchBar';

interface Props {
    value: string;
}

export function SearchBar({ value }: Props) {
    return (
        <SharedSearchBar
            value={value}
            route="/livres"
            placeholder="Titre, auteur, collection, éditeur…"
        />
    );
}
