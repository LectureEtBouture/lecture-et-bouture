import Link from 'next/link';
import type { EvenementStatus } from '../evenements/_components/EvenementItem';

type Props = {
    evenement: {
        id: number;
        titre: string;
        description: string | null;
        lieu: string | null;
        dateDebut: Date;
        dateFin: Date | null;
    };
    status: EvenementStatus;
};

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

function formatHeure(date: Date) {
    return new Date(date).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function EvenementEnAvant({ evenement, status }: Props) {
    return (
        <section className="border-t border-border">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 sm:py-20">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
                    <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                            {status === 'en_cours'
                                ? 'En ce moment'
                                : 'Prochain événement'}
                        </p>
                        {status === 'en_cours' && (
                            <span className="inline-block text-[9px] uppercase tracking-[0.12em] font-medium text-primary border border-primary/40 px-2 py-0.5 leading-none mt-2">
                                En cours
                            </span>
                        )}
                    </div>
                    <Link
                        href="/evenements"
                        className="text-[11px] uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors shrink-0"
                    >
                        Tout l&apos;agenda
                    </Link>
                </div>

                <div className="mt-6 max-w-2xl">
                    <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-foreground leading-[1.1] tracking-[-0.01em]">
                        {evenement.titre}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-3">
                        <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
                            {formatDate(evenement.dateDebut)}
                        </span>
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
                        <p className="text-base text-foreground/70 leading-[1.75] max-w-[60ch] mt-4">
                            {evenement.description}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
