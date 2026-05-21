'use client';

import { useState } from 'react';
import type { LivreMetadata } from '@/lib/services/books/types';
import { inputClass, labelClass } from './formStyles';

interface Props {
    defaultValue?: string;
    isbnExterne?: string;
    onImport: (data: LivreMetadata) => void;
}

export function ISBNImportRow({ defaultValue = '', isbnExterne, onImport }: Props) {
    const [isbn, setIsbn] = useState(isbnExterne || defaultValue);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imported, setImported] = useState(false);

    async function handleImport() {
        const query = isbn.trim();
        if (!query) return;
        setLoading(true);
        setError(null);
        setImported(false);
        try {
            const res = await fetch(`/api/books/isbn?q=${encodeURIComponent(query)}`);
            if (res.status === 404) {
                setError('ISBN introuvable');
                return;
            }
            if (!res.ok) {
                setError('Erreur lors de la recherche');
                return;
            }
            const data: LivreMetadata = await res.json();
            setImported(true);
            onImport(data);
        } catch {
            setError('Erreur réseau');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <label className={labelClass}>ISBN</label>
            <div className="flex gap-2">
                <input
                    name="isbn"
                    value={isbn}
                    onChange={(e) => {
                        setIsbn(e.target.value);
                        setImported(false);
                        setError(null);
                    }}
                    className={inputClass}
                />
                <button
                    type="button"
                    onClick={handleImport}
                    disabled={!isbn.trim() || loading}
                    className="shrink-0 px-3 py-2 bg-primary text-background text-[10px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {loading ? '…' : imported ? '✓' : 'Importer'}
                </button>
            </div>
            {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
        </div>
    );
}
