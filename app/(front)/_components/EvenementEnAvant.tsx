import Link from 'next/link';
import type { EvenementStatus } from '../evenements/_components/EvenementItem';

type Props = {
    evenement: {
        id: number;
        titre: string;
        description: string | null;
        lieu: string | null;
        image: string | null;
        dateDebut: Date;
        dateFin: Date | null;
    };
    status: EvenementStatus;
    hideAgendaLink?: boolean;
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

function isSameDay(a: Date, b: Date) {
    const da = new Date(a);
    const db = new Date(b);
    return (
        da.getFullYear() === db.getFullYear() &&
        da.getMonth() === db.getMonth() &&
        da.getDate() === db.getDate()
    );
}

export function EvenementEnAvant({
    evenement,
    status,
    hideAgendaLink = false,
}: Props) {
    const enCours = status === 'en_cours';
    const singleDayEndTime =
        evenement.dateFin &&
        isSameDay(evenement.dateDebut, evenement.dateFin);

    return (
        <section className="border-t-2 border-primary">
            <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24">
                <div className="flex items-start justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <p className="text-xs uppercase tracking-[0.16em] font-medium text-muted">
                            {enCours ? 'En ce moment' : 'Prochain événement'}
                        </p>
                        {enCours && (
                            <span className="text-[9px] uppercase tracking-[0.12em] font-medium text-primary bg-primary/10 border border-primary/30 px-2 py-1 leading-none">
                                En cours
                            </span>
                        )}
                    </div>
                    {!hideAgendaLink && (
                        <Link
                            href="/evenements"
                            className="text-[11px] uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors shrink-0"
                        >
                            Tout l&apos;agenda
                        </Link>
                    )}
                </div>

                <div className={`mt-8 ${evenement.image ? 'grid lg:grid-cols-[1fr_380px] items-stretch gap-12' : ''}`}>
                    <div className="max-w-3xl">
                        <h2 className="font-serif text-[clamp(2rem,4vw,3.25rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                            {evenement.titre}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-5">
                            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
                                {formatDate(evenement.dateDebut)}
                            </span>
                            <span className="text-muted/40 text-[10px]">·</span>
                            <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
                                {formatHeure(evenement.dateDebut)}
                                {singleDayEndTime &&
                                    ` — ${formatHeure(evenement.dateFin!)}`}
                            </span>
                            {evenement.lieu && (
                                <>
                                    <span className="text-muted/40 text-[10px]">
                                        ·
                                    </span>
                                    <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
                                        {evenement.lieu}
                                    </span>
                                </>
                            )}
                        </div>
                        {evenement.description && (
                            <p className="text-base text-foreground/65 leading-[1.8] max-w-[58ch] mt-6">
                                {evenement.description}
                            </p>
                        )}
                    </div>
                    {evenement.image && (
                        <div className="relative h-52 lg:h-auto lg:min-h-[280px]">
                            <img
                                src={evenement.image}
                                alt={evenement.titre}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
