import type { MetadataRoute } from 'next';
import { getLivresPubliques } from '@/lib/queries/livres';
import { getBouturesPubliques } from '@/lib/queries/boutures';
import { siteConfig } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

const base = siteConfig.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [livres, boutures] = await Promise.all([
        getLivresPubliques(),
        getBouturesPubliques(),
    ]);
    const now = new Date();

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: base,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${base}/livres`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${base}/boutures`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${base}/surprendre`,
            lastModified: now,
            changeFrequency: 'always',
            priority: 0.7,
        },
        {
            url: `${base}/concept`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${base}/contact`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.4,
        },
    ];

    const livreRoutes: MetadataRoute.Sitemap = livres.map((livre) => ({
        url: `${base}/livres/${livre.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    const boutureRoutes: MetadataRoute.Sitemap = boutures.map((bouture) => ({
        url: `${base}/boutures/${bouture.slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    return [...staticRoutes, ...livreRoutes, ...boutureRoutes];
}
