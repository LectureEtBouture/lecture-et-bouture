import type { Metadata } from 'next';
import { siteConfig } from '@/lib/metadata';
import {
    getLivresMisEnAvant,
    getLivresNouveautes,
    getLivresTendances,
    getLivresParSujet,
} from '@/lib/queries/livres';
import { getEvenementMisEnAvant } from '@/lib/queries/evenements';
import {
    getArticlesEnAvant,
    getCategoriesParArticles,
} from '@/lib/queries/articles';
import { HeroSection } from './_components/HeroSection';
import { LivresSection } from './_components/LivresSection';
import { SurprendreSection } from './_components/SurprendreSection';
import { EvenementEnAvant } from './_components/EvenementEnAvant';
import { BlogEnAvant } from './_components/BlogEnAvant';

export const metadata: Metadata = {
    title: siteConfig.name,
};

export const dynamic = 'force-dynamic';

const GENRE_SECTIONS = [
    {
        id: 'imaginaire',
        titre: 'Imaginaire',
        description: 'Science-fiction, fantasy, mondes à part entière.',
        query: 'subject:fantasy subject:science-fiction roman',
        href: '/livres?q=fantasy+science-fiction',
    },
    {
        id: 'sciences-nature',
        titre: 'Sciences & Nature',
        description: 'Botanique, écologie, sciences du vivant.',
        query: 'botanique nature écologie sciences',
        href: '/livres?q=botanique+nature',
    },
] as const;

export default async function HomePage() {
    const [
        choix,
        nouveautes,
        tendances,
        evenementMisEnAvant,
        articlesEnAvant,
        ...genreLivres
    ] = await Promise.all([
        getLivresMisEnAvant(),
        getLivresNouveautes(0),
        getLivresTendances(0),
        getEvenementMisEnAvant(),
        getArticlesEnAvant(),
        ...GENRE_SECTIONS.map((section) => getLivresParSujet(section.query)),
    ]);

    const blogCategoriesMap = await getCategoriesParArticles(
        articlesEnAvant.map((article) => article.id),
    );

    return (
        <>
            <HeroSection />
            <LivresSection
                titre="Choix de la librairie"
                description="Ce que notre équipe aime vraiment."
                livres={choix}
                href="/livres?choix=1"
            />
            <LivresSection
                titre="Nouveautés"
                description="Les dernières parutions."
                livres={nouveautes}
                href="/livres?sort=newest"
            />
            <LivresSection
                titre="Tendances"
                description="Ce qu'on lit en ce moment."
                livres={tendances}
                href="/livres?sort=relevance"
            />
            {GENRE_SECTIONS.map((section, index) => (
                <LivresSection
                    key={section.id}
                    titre={section.titre}
                    description={section.description}
                    livres={genreLivres[index]}
                    href={section.href}
                />
            ))}
            {evenementMisEnAvant && (
                <EvenementEnAvant
                    evenement={evenementMisEnAvant.evenement}
                    status={evenementMisEnAvant.status}
                />
            )}
            <BlogEnAvant
                articles={articlesEnAvant}
                categoriesMap={blogCategoriesMap}
            />
            <SurprendreSection />
        </>
    );
}
