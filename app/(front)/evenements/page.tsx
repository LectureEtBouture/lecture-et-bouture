import type { Metadata } from 'next';
import { getEvenements } from '@/lib/actions/evenements';
import { EvenementItem } from './_components/EvenementItem';

export const metadata: Metadata = {
    title: 'Événements',
    description:
        'Rencontres, lectures, ateliers — agenda de la librairie Lecture & Boutures.',
};

export const dynamic = 'force-dynamic';

export default async function EvenementsPage() {
    const all = await getEvenements();
    const now = new Date();
    const upcoming = all.filter((e) => new Date(e.dateDebut) >= now);
    const past = all
        .filter((e) => new Date(e.dateDebut) < now)
        .slice(-5)
        .reverse();

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

            {upcoming.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-sm text-muted italic">
                        Aucun événement prévu pour le moment.
                    </p>
                    <p className="text-[11px] text-muted/60 mt-2 uppercase tracking-[0.1em]">
                        Revenez bientôt.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {upcoming.map((evenement) => (
                        <EvenementItem
                            key={evenement.id}
                            evenement={evenement}
                        />
                    ))}
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
                                past
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
