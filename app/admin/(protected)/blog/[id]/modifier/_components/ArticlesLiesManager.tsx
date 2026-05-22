'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { addArticleLien, removeArticleLien } from '@/lib/actions/articles';
import type { ArticleItem } from '@/lib/queries/articles';

export function ArticlesLiesManager({
    articleId,
    lies: initialLies,
    tous,
}: {
    articleId: string;
    lies: ArticleItem[];
    tous: ArticleItem[];
}) {
    const router = useRouter();
    const [lies, setLies] = useState<ArticleItem[]>(initialLies);
    const [search, setSearch] = useState('');
    const [pending, startTransition] = useTransition();

    const lieIds = new Set(lies.map((article) => article.id));
    const disponibles = tous.filter(
        (article) =>
            article.id !== articleId &&
            !lieIds.has(article.id) &&
            article.titre.toLowerCase().includes(search.toLowerCase()),
    );

    function handleAdd(article: ArticleItem) {
        setLies((prev) => [...prev, article]);
        setSearch('');
        startTransition(async () => {
            await addArticleLien(articleId, article.id);
            router.refresh();
        });
    }

    function handleRemove(lieId: string) {
        setLies((prev) => prev.filter((article) => article.id !== lieId));
        startTransition(async () => {
            await removeArticleLien(articleId, lieId);
            router.refresh();
        });
    }

    return (
        <div className="space-y-4 pb-6 border-b border-border/60">
            <p className="text-xs font-medium text-foreground uppercase tracking-widest">
                Articles liés
            </p>
            {lies.length > 0 && (
                <div>
                    {lies.map((lie) => (
                        <div
                            key={lie.id}
                            className="flex items-center justify-between py-2 border-b border-border/40"
                        >
                            <span className="text-sm text-foreground">
                                {lie.titre}
                            </span>
                            <button
                                onClick={() => handleRemove(lie.id)}
                                disabled={pending}
                                className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors disabled:opacity-40"
                            >
                                Retirer
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="space-y-2">
                <input
                    type="text"
                    placeholder="Rechercher un article…"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
                {search.length > 0 && (
                    <div className="border border-border bg-white max-h-48 overflow-y-auto">
                        {disponibles.length === 0 ? (
                            <p className="text-xs text-muted px-3 py-2">
                                Aucun résultat
                            </p>
                        ) : (
                            disponibles.map((article) => (
                                <button
                                    key={article.id}
                                    type="button"
                                    disabled={pending}
                                    onClick={() => handleAdd(article)}
                                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-surface transition-colors disabled:opacity-40"
                                >
                                    {article.titre}
                                    {article.auteurNom && (
                                        <span className="text-muted ml-2 text-[11px]">
                                            {article.auteurNom}
                                        </span>
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
