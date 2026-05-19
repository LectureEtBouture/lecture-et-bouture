import Link from 'next/link';

type LivreRow = { id: number; titre: string; auteur: string };
type BoutureRow = { id: number; nom: string };

export function RupturesList({
    livres,
    boutures,
}: {
    livres: LivreRow[];
    boutures: BoutureRow[];
}) {
    const total = livres.length + boutures.length;

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted">
                    Ruptures de stock
                </h2>
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/livres"
                        className="text-[11px] text-muted hover:text-primary transition-colors"
                    >
                        Livres →
                    </Link>
                    <Link
                        href="/admin/boutures"
                        className="text-[11px] text-muted hover:text-primary transition-colors"
                    >
                        Boutures →
                    </Link>
                </div>
            </div>
            {total === 0 ? (
                <p className="text-sm text-muted py-2">Aucune rupture.</p>
            ) : (
                <div className="space-y-1">
                    {livres.map((livre) => (
                        <div
                            key={livre.id}
                            className="flex items-baseline justify-between py-1.5 border-b border-border/40"
                        >
                            <div className="min-w-0">
                                <span className="text-sm text-foreground leading-snug truncate block">
                                    {livre.titre}
                                </span>
                                <span className="text-xs text-muted">
                                    {livre.auteur}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span className="text-[10px] uppercase tracking-[0.08em] text-muted bg-surface px-2 py-0.5">
                                    Livre
                                </span>
                                <Link
                                    href={`/admin/livres/${livre.id}/modifier`}
                                    className="text-xs text-muted hover:text-primary transition-colors"
                                >
                                    Modifier
                                </Link>
                            </div>
                        </div>
                    ))}
                    {boutures.map((bouture) => (
                        <div
                            key={bouture.id}
                            className="flex items-baseline justify-between py-1.5 border-b border-border/40"
                        >
                            <span className="text-sm text-foreground">
                                {bouture.nom}
                            </span>
                            <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span className="text-[10px] uppercase tracking-[0.08em] text-muted bg-surface px-2 py-0.5">
                                    Bouture
                                </span>
                                <Link
                                    href={`/admin/boutures/${bouture.id}/modifier`}
                                    className="text-xs text-muted hover:text-primary transition-colors"
                                >
                                    Modifier
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
