import type { Metadata } from 'next';
import { siteConfig } from '@/lib/metadata';
import { getLivresPubliques } from '@/lib/queries/livres';
import { getEvenementMisEnAvant } from '@/lib/queries/evenements';
import { HeroSection } from './_components/HeroSection';
import { LivresSection } from './_components/LivresSection';
import { SurprendreSection } from './_components/SurprendreSection';
import { EvenementEnAvant } from './_components/EvenementEnAvant';

export const metadata: Metadata = {
    title: siteConfig.name,
};

const LIMIT = 8;

const SECTIONS = [
    {
        id: 'nouveautes',
        titre: 'Nouveautés',
        description: 'Les dernières arrivées dans nos rayons.',
        filters: { sort: 'date' as const },
        href: '/livres?sort=date',
    },
    {
        id: 'imaginaire',
        titre: 'Imaginaire',
        description: 'Science-fiction, fantasy, mondes à part entière.',
        filters: { rayonSlug: 'imaginaire' },
        href: '/livres',
    },
    {
        id: 'sciences-nature',
        titre: 'Sciences & Nature',
        description: 'Botanique, écologie, sciences du vivant.',
        filters: { rayonSlug: 'sciences-nature' },
        href: '/livres',
    },
    {
        id: 'choix',
        titre: 'Choix de la librairie',
        description: 'Ce que notre équipe aime vraiment.',
        filters: { choixLibrairie: true as const },
        href: '/livres?choix=1',
    },
] as const;

export const dynamic = 'force-dynamic';

export default async function HomePage() {
    const [livresParSection, evenementMisEnAvant] = await Promise.all([
        Promise.all(
            SECTIONS.map((section) =>
                getLivresPubliques(section.filters).then((livres) =>
                    livres.slice(0, LIMIT),
                ),
            ),
        ),
        getEvenementMisEnAvant(),
    ]);

    return (
        <>
            <HeroSection />
            {SECTIONS.map((section, index) => (
                <LivresSection
                    key={section.id}
                    titre={section.titre}
                    description={section.description}
                    livres={livresParSection[index]}
                    href={section.href}
                />
            ))}
            {evenementMisEnAvant && (
                <EvenementEnAvant
                    evenement={evenementMisEnAvant.evenement}
                    status={evenementMisEnAvant.status}
                />
            )}
            <SurprendreSection />
        </>
    );
}
