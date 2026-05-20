import Link from 'next/link';

type Evenement = {
    id: string;
    titre: string;
    dateDebut: Date;
    lieu: string | null;
};

function formatEvenementDate(date: Date) {
    const d = new Date(date);
    const jour = d.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
    const heure = d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return { jour, heure };
}

export function AgendaPanel({ evenements }: { evenements: Evenement[] }) {
    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
                <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted">
                    Prochains événements
                </h2>
                <Link
                    href="/admin/evenements"
                    className="text-[11px] text-muted hover:text-primary transition-colors"
                >
                    Gérer →
                </Link>
            </div>
            {evenements.length === 0 ? (
                <p className="text-sm text-muted py-2 italic">
                    Aucun événement planifié.
                </p>
            ) : (
                <div className="space-y-3">
                    {evenements.map((evenement) => {
                        const { jour, heure } = formatEvenementDate(
                            evenement.dateDebut,
                        );
                        return (
                            <div
                                key={evenement.id}
                                className="flex items-start gap-4 py-1.5 border-b border-border/40"
                            >
                                <div className="shrink-0 text-center w-16">
                                    <p className="text-[11px] uppercase tracking-[0.08em] text-muted">
                                        {jour}
                                    </p>
                                    <p className="text-[11px] text-muted/70">
                                        {heure}
                                    </p>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-foreground font-medium leading-snug">
                                        {evenement.titre}
                                    </p>
                                    {evenement.lieu && (
                                        <p className="text-xs text-muted mt-0.5">
                                            {evenement.lieu}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
