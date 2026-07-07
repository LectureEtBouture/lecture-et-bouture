'use client';

import { useState } from 'react';
import { inputClass } from '@/components/admin/formStyles';

export type ArticleEnrichi = {
    id: string;
    titre: string;
    image: string | null;
    publie: boolean;
};

export function SelectionArticlePicker({
    articles,
    onPick,
}: {
    articles: ArticleEnrichi[];
    onPick: (article: ArticleEnrichi) => void;
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = articles.filter((article) =>
        article.titre.toLowerCase().includes(search.toLowerCase()),
    );

    if (!open) {
        return (
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="text-[11px] uppercase tracking-[0.08em] text-primary hover:underline"
            >
                Parcourir les articles ({articles.length})
            </button>
        );
    }

    return (
        <div className="border border-border p-3 space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground">
                    Articles de blog
                </p>
                <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-[11px] text-muted hover:text-foreground"
                >
                    Fermer
                </button>
            </div>
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par titre…"
                className={`${inputClass} w-full`}
            />
            <ul className="max-h-64 overflow-y-auto divide-y divide-border/50">
                {filtered.length === 0 ? (
                    <li className="text-[11px] text-muted py-3 text-center">
                        Aucun résultat.
                    </li>
                ) : (
                    filtered.map((article) => (
                        <li key={article.id}>
                            <button
                                type="button"
                                onClick={() => onPick(article)}
                                className="w-full text-left px-2 py-2 text-sm hover:bg-surface transition-colors flex items-center gap-2"
                            >
                                {article.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={article.image}
                                        alt=""
                                        className="w-6 h-8 object-cover shrink-0 rounded-sm"
                                    />
                                )}
                                <span className="min-w-0 truncate">
                                    {article.titre}
                                </span>
                                {!article.publie && (
                                    <span className="text-[9px] uppercase tracking-widest text-muted shrink-0 ml-auto">
                                        Brouillon
                                    </span>
                                )}
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
