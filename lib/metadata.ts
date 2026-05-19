import type { Metadata } from 'next';
import { storeConfig } from './config';

export const siteConfig = storeConfig;

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
