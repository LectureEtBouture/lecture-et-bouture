'use client';

import { SearchBar } from '@/components/ui/SearchBar';

export function AdminSearchBar({ value }: { value: string }) {
    return (
        <SearchBar
            value={value}
            route="/admin/livres"
            placeholder="Titre, auteur, ISBN…"
        />
    );
}
