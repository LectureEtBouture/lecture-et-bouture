import { getArticles } from '@/lib/queries/articles';
import { extraireTexte } from '@/lib/extrait';
import { siteConfig } from '@/lib/metadata';

export const dynamic = 'force-dynamic';

function x(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export async function GET() {
    const articles = await getArticles();
    const base = siteConfig.url.replace(/\/$/, '');

    const items = articles
        .map((article) => {
            const extrait = article.contenu
                ? extraireTexte(article.contenu, 250)
                : '';
            const pubDate = new Date(
                article.publishedAt ?? article.createdAt,
            ).toUTCString();

            return [
                '<item>',
                `  <title>${x(article.titre)}</title>`,
                `  <link>${base}/blog/${x(article.slug)}</link>`,
                `  <guid isPermaLink="true">${base}/blog/${x(article.slug)}</guid>`,
                `  <pubDate>${pubDate}</pubDate>`,
                extrait ? `  <description>${x(extrait)}</description>` : '',
                article.auteurNom
                    ? `  <author>${x(article.auteurNom)}</author>`
                    : '',
                '</item>',
            ]
                .filter(Boolean)
                .join('\n');
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${x(siteConfig.name)} — Blog</title>
    <link>${base}/blog</link>
    <description>Sélections, nouveautés, et quelques mots sur les livres et la botanique.</description>
    <language>fr</language>
    <atom:link href="${base}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
