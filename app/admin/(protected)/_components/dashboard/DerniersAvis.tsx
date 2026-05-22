import Link from 'next/link';

type AvisRow = {
    id: string;
    auteurNom: string;
    note: number | null;
    type: string;
    produitNom: string | null;
    approuve: boolean;
    masque: boolean;
    createdAt: Date;
};

export function DerniersAvis({ avis }: { avis: AvisRow[] }) {
    return (
        <section className="space-y-3">
            <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted border-b border-border pb-2">
                Derniers avis
            </h2>
            {avis.length === 0 ? (
                <p className="text-sm text-muted py-2">
                    Aucun avis pour l&apos;instant.
                </p>
            ) : (
                <div className="space-y-1">
                    {avis.map((a) => {
                        const statut =
                            !a.approuve && !a.masque
                                ? 'En attente'
                                : a.masque
                                  ? 'Masqué'
                                  : 'Visible';
                        const statutCls =
                            !a.approuve && !a.masque
                                ? 'text-amber-600'
                                : a.masque
                                  ? 'text-muted'
                                  : 'text-primary';
                        const stars =
                            a.note != null
                                ? '★'.repeat(a.note) + '☆'.repeat(5 - a.note)
                                : null;
                        return (
                            <div
                                key={a.id}
                                className="flex items-start justify-between py-1.5 border-b border-border/40 gap-4"
                            >
                                <div className="min-w-0 space-y-0.5">
                                    <p className="text-sm text-foreground font-medium">
                                        {a.auteurNom}
                                    </p>
                                    <p className="text-xs text-muted truncate">
                                        {a.produitNom ??
                                            (a.type === 'livre'
                                                ? 'Livre'
                                                : 'Bouture')}
                                    </p>
                                    <p className="text-[11px] tracking-wide text-muted/70">
                                        {stars}
                                    </p>
                                </div>
                                <div className="shrink-0 text-right space-y-1">
                                    <p
                                        className={`text-[10px] uppercase tracking-[0.08em] ${statutCls}`}
                                    >
                                        {statut}
                                    </p>
                                    <p className="text-[11px] text-muted/60">
                                        {new Date(
                                            a.createdAt,
                                        ).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <Link
                        href="/admin/avis"
                        className="text-xs text-muted hover:text-primary transition-colors block pt-1"
                    >
                        Voir tous les avis →
                    </Link>
                </div>
            )}
        </section>
    );
}
