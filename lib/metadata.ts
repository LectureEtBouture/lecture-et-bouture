import type { Metadata } from 'next';

export const siteConfig = {
    name: 'Lecture & Boutures',
    tagline: "Cultiver l'esprit, nourrir la terre.",
    description:
        'Livres soignés et boutures rares, curatés avec intention. Une librairie botanique.',
    url: 'https://lectureetboutures.fr',
    locale: 'fr_FR',
};

export const baseMetadata: Metadata = {
    title: {
        default: siteConfig.name,
        template: `%s — ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: '/' },
    openGraph: {
        type: 'website',
        locale: siteConfig.locale,
        siteName: siteConfig.name,
        title: siteConfig.name,
        description: siteConfig.description,
    },
    robots: {
        index: true,
        follow: true,
    },
};
