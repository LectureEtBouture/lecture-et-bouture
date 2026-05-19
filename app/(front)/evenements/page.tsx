import type { Metadata } from 'next';
import { getEvenementsPublics } from '@/lib/queries/evenements';
import { siteConfig } from '@/lib/metadata';
import { EvenementItem } from './_components/EvenementItem';
import type { EvenementStatus } from './_components/EvenementItem';
import { EvenementEnAvant } from '../_components/EvenementEnAvant';

export const metadata: Metadata = {
    title: 'Événements',
    description: `Rencontres, lectures, ateliers — agenda de la librairie ${siteConfig.name}.`,
};

export const dynamic = 'force-dynamic';

function getStatus(
    dateDebut: Date,
    dateFin: Date | null,
    now: Date,
): EvenementStatus {
    const debut = new Date(dateDebut);
    const fin = dateFin ? new Date(dateFin) : null;
    if (debut <= now && fin !== null && fin > now) return 'en_cours';
    if (debut > now) return 'upcoming';
    return 'past';
}

export default async function EvenementsPage() {
    const all = await getEvenementsPublics();
    const now = new Date();

    const withStatus = all.map((e) => ({
        ...e,
        status: getStatus(e.dateDebut, e.dateFin, now),
    }));

    const enCours = withStatus.filter((e) => e.status === 'en_cours');
    const upcoming = withStatus.filter((e) => e.status === 'upcoming');
    const past = withStatus
        .filter((e) => e.status === 'past')
        .slice(-5)
        .reverse();

    const hasActive = enCours.length > 0 || upcoming.length > 0;

    return (
        <div className="max-w-3xl mx-auto px-6 py-section">
            <header className="space-y-4 pb-10 border-b border-border">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Agenda
                </p>
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                    Événements
                </h1>
            </header>

            {!hasActive ? (
                <div className="py-16 text-center">
                    <p className="text-sm text-muted italic">
                        Aucun événement prévu pour le moment.
                    </p>
                    <p className="text-[11px] text-muted/60 mt-2 uppercase tracking-[0.1em]">
                        Revenez bientôt.
                    </p>
                </div>
            ) : (
                <div>
                    {enCours.map((evenement) => (
                        <EvenementEnAvant
                            key={evenement.id}
                            evenement={evenement}
                            status="en_cours"
                            hideAgendaLink
                        />
                    ))}
                    {upcoming.length > 0 && (
                        <div className="divide-y divide-border mt-2">
                            {upcoming.map((evenement) => (
                                <EvenementItem
                                    key={evenement.id}
                                    evenement={evenement}
                                    status="upcoming"
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {past.length > 0 && (
                <section className="mt-16 pt-8 border-t border-border">
                    <p className="text-[11px] uppercase tracking-[0.1em] text-muted mb-6">
                        Passés
                    </p>
                    <div className="divide-y divide-border">
                        {past.map((evenement) => (
                            <EvenementItem
                                key={evenement.id}
                                evenement={evenement}
                                status="past"
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
