'use client';

import { useState, useRef, useCallback } from 'react';
import type { LivreMetadata, LivreSearchResult } from '@/lib/services/books/types';
import { inputClass, labelClass } from './formStyles';

interface Props {
    onImport: (data: LivreMetadata) => void;
}

function toMetadata(result: LivreSearchResult): LivreMetadata {
    return {
        sourceId: result.uri,
        titre: result.titre,
        auteur: result.auteur,
        isbn: result.isbn,
        editeur: result.editeur,
        anneePublication: result.anneePublication,
        publishedDateRaw: null,
        serie: null,
        imageUrl: result.imageUrl,
        description: result.description,
        language: null,
        categories: result.categories,
        prixNumerique: result.prixNumerique,
        isEbook: result.isEbook,
    };
}

export function TitreAuteurSearch({ onImport }: Props) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<LivreSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [showEbook, setShowEbook] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const search = useCallback(async (value: string) => {
        if (value.trim().length < 2) {
            setResults([]);
            setOpen(false);
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`/api/books/search?q=${encodeURIComponent(value)}`);
            if (!res.ok) { setResults([]); return; }
            const data: LivreSearchResult[] = await res.json();
            setResults(data);
            setOpen(data.length > 0);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    function handleChange(value: string) {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(value), 350);
    }

    function handleSelect(result: LivreSearchResult) {
        onImport(toMetadata(result));
        setQuery('');
        setResults([]);
        setOpen(false);
    }

    const visibleResults = showEbook ? results : results.filter((result) => !result.isEbook);

    return (
        <div className="relative">
            <label className={labelClass}>Recherche titre / auteur</label>
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    onFocus={() => results.length > 0 && setOpen(true)}
                    placeholder="Ex : Harry Potter, Tolkien…"
                    className={inputClass}
                />
                {loading && (
                    <span className="text-[11px] text-muted shrink-0">…</span>
                )}
                <label className="flex items-center gap-1.5 text-[11px] text-muted whitespace-nowrap cursor-pointer shrink-0">
                    <input
                        type="checkbox"
                        checked={showEbook}
                        onChange={(e) => setShowEbook(e.target.checked)}
                        className="w-3 h-3"
                    />
                    Ebooks
                </label>
            </div>
            {open && (
                <ul className="absolute z-10 mt-1 w-full border border-border bg-white shadow-md max-h-64 overflow-y-auto">
                    {visibleResults.map((result) => (
                        <li key={result.uri}>
                            <button
                                type="button"
                                onMouseDown={() => handleSelect(result)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-surface transition-colors"
                            >
                                <div className="flex items-start gap-2">
                                    {result.imageUrl && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={result.imageUrl}
                                            alt=""
                                            className="w-8 h-10 object-cover shrink-0 rounded-sm"
                                        />
                                    )}
                                    <div className="min-w-0">
                                        <span className="font-medium text-foreground">
                                            {result.titre}
                                        </span>
                                        {result.description && (
                                            <span className="block text-[11px] text-muted truncate">
                                                {result.description}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
