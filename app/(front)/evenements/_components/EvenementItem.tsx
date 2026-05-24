import Image from 'next/image';

type Evenement = {
    id: string;
    titre: string;
    description: string | null;
    lieu: string | null;
    image: string | null;
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

function formatMoisCourt(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', { month: 'short' });
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

function isSameMonth(a: Date, b: Date) {
    const da = new Date(a);
    const db = new Date(b);
    return (
        da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth()
    );
}

function DateColumn({
    dateDebut,
    dateFin,
}: {
    dateDebut: Date;
    dateFin: Date | null;
}) {
    const multiDay = dateFin && !isSameDay(dateDebut, dateFin);

    if (!multiDay) {
        return (
            <div className="shrink-0 w-16 text-center pt-0.5">
                <p className="font-serif text-3xl font-bold text-foreground leading-none tabular-nums">
                    {formatJour(dateDebut)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted mt-1">
                    {formatMois(dateDebut)}
                </p>
            </div>
        );
    }

    if (isSameMonth(dateDebut, dateFin)) {
        return (
            <div className="shrink-0 w-16 text-center pt-0.5">
                <p className="font-serif text-2xl font-bold text-foreground leading-none tabular-nums">
                    {formatJour(dateDebut)}–{formatJour(dateFin)}
                </p>
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted mt-1">
                    {formatMois(dateDebut)}
                </p>
            </div>
        );
    }

    return (
        <div className="shrink-0 w-20 text-center pt-0.5 space-y-0.5">
            <p className="font-serif text-lg font-bold text-foreground leading-none tabular-nums">
                {formatJour(dateDebut)}{' '}
                <span className="text-[11px] font-sans font-medium text-muted uppercase tracking-[0.06em] not-italic">
                    {formatMoisCourt(dateDebut)}
                </span>
            </p>
            <p className="text-muted text-xs leading-none">→</p>
            <p className="font-serif text-lg font-bold text-foreground leading-none tabular-nums">
                {formatJour(dateFin)}{' '}
                <span className="text-[11px] font-sans font-medium text-muted uppercase tracking-[0.06em] not-italic">
                    {formatMoisCourt(dateFin)}
                </span>
            </p>
        </div>
    );
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
            <DateColumn
                dateDebut={evenement.dateDebut}
                dateFin={evenement.dateFin}
            />
            <div className="min-w-0 flex-1 space-y-2">
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
                            isSameDay(evenement.dateDebut, evenement.dateFin) &&
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
                {status !== 'past' && (
                    <a
                        href={`/evenements/${evenement.id}/ical`}
                        className="inline-block text-[10px] uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors pt-1"
                    >
                        + Calendrier
                    </a>
                )}
            </div>
            {evenement.image && (
                <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 relative">
                    <Image
                        src={evenement.image}
                        alt=""
                        fill
                        className="object-cover"
                    />
                </div>
            )}
        </article>
    );
}
