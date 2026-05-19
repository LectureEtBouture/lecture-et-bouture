type Evenement = {
    id: number;
    titre: string;
    description: string | null;
    lieu: string | null;
    dateDebut: Date;
    dateFin: Date | null;
};

export type EvenementStatus = 'upcoming' | 'en_cours' | 'past';

function formatJour(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric' });
}

function formatMois(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'long' });
}

function formatHeure(date: Date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function EvenementItem({
    evenement,
    status = 'upcoming',
}: {
    evenement: Evenement;
    status?: EvenementStatus;
}) {
    return (
        <article
            className={`flex gap-8 py-8 border-b border-border ${status === 'past' ? 'opacity-40' : ''}`}
        >
            <div className="shrink-0 w-16 text-center pt-0.5">
                <p className="font-serif text-3xl font-bold text-foreground leading-none tabular-nums">
                    {formatJour(evenement.dateDebut)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted mt-1">
                    {formatMois(evenement.dateDebut)}
                </p>
            </div>
            <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-serif text-xl font-bold text-foreground leading-snug">
                        {evenement.titre}
                    </h2>
                    {status === 'en_cours' && (
                        <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-primary border border-primary/40 px-2 py-0.5 leading-none">
                            En cours
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        {formatHeure(evenement.dateDebut)}
                        {evenement.dateFin &&
                            ` — ${formatHeure(evenement.dateFin)}`}
                    </span>
                    {evenement.lieu && (
                        <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
                            {evenement.lieu}
                        </span>
                    )}
                </div>
                {evenement.description && (
                    <p className="text-sm text-foreground/75 leading-relaxed max-w-[60ch] pt-1">
                        {evenement.description}
                    </p>
                )}
            </div>
        </article>
    );
}
