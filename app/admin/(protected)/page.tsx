import { db } from '@/db';
import { livres, plantes, avis } from '@/db/schema';
import { eq, and, count, desc } from 'drizzle-orm';
import { getProchainEvenements } from '@/lib/actions/evenements';
import { siteConfig } from '@/lib/metadata';
import { StatsLedger } from './_components/dashboard/StatsLedger';
import { AlerteBar } from './_components/dashboard/AlerteBar';
import { RupturesList } from './_components/dashboard/RupturesList';
import { DerniersAvis } from './_components/dashboard/DerniersAvis';
import { AgendaPanel } from './_components/dashboard/AgendaPanel';

function formatDate() {
    return new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export default async function AdminPage() {
    const [
        [totalLivres],
        [totalBoutures],
        [avisEnAttente],
        [avisPublies],
        livresSansStock,
        boutureSansStock,
        derniersAvis,
        prochainEvenements,
    ] = await Promise.all([
        db.select({ count: count() }).from(livres),
        db.select({ count: count() }).from(plantes),
        db
            .select({ count: count() })
            .from(avis)
            .where(and(eq(avis.approuve, false), eq(avis.masque, false))),
        db
            .select({ count: count() })
            .from(avis)
            .where(and(eq(avis.approuve, true), eq(avis.masque, false))),
        db
            .select({
                id: livres.id,
                titre: livres.titre,
                auteur: livres.auteur,
            })
            .from(livres)
            .where(eq(livres.stock, 0))
            .limit(8),
        db
            .select({ id: plantes.id, nom: plantes.nom })
            .from(plantes)
            .where(eq(plantes.stock, 0))
            .limit(8),
        db
            .select({
                id: avis.id,
                auteurNom: avis.auteurNom,
                note: avis.note,
                type: avis.type,
                produitNom: avis.produitNom,
                approuve: avis.approuve,
                masque: avis.masque,
                createdAt: avis.createdAt,
            })
            .from(avis)
            .orderBy(desc(avis.createdAt))
            .limit(5),
        getProchainEvenements(5),
    ]);

    const ruptures = livresSansStock.length + boutureSansStock.length;

    const statsLines = [
        {
            label: 'Livres en catalogue',
            value: totalLivres.count,
            href: '/admin/livres',
        },
        {
            label: 'Boutures disponibles',
            value: totalBoutures.count,
            href: '/admin/boutures',
        },
        {
            label: 'Avis publiés',
            value: avisPublies.count,
            href: '/admin/avis',
        },
    ];

    const alertes = [
        {
            label: 'avis en attente de validation',
            count: avisEnAttente.count,
            href: '/admin/avis',
        },
        {
            label: 'rupture' + (ruptures > 1 ? 's' : '') + ' de stock',
            count: ruptures,
            href: '/admin/livres',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted mb-1">
                    {formatDate()}
                </p>
                <h1 className="font-serif text-3xl font-bold text-foreground leading-tight">
                    {siteConfig.name}
                </h1>
            </div>

            <StatsLedger lines={statsLines} />
            <AlerteBar alertes={alertes} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
                <div className="space-y-8">
                    <RupturesList
                        livres={livresSansStock}
                        boutures={boutureSansStock}
                    />
                    <DerniersAvis avis={derniersAvis} />
                </div>
                <AgendaPanel evenements={prochainEvenements} />
            </div>
        </div>
    );
}
