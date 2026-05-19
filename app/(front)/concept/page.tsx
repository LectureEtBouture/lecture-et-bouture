import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPageEditorialeWithDraft } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';
import { siteConfig } from '@/lib/metadata';

export const metadata: Metadata = {
    title: 'Notre concept',
    description: `${siteConfig.name} — ${siteConfig.tagline}`,
};

export default async function ConceptPage() {
    const page = await fetchPageEditorialeWithDraft('concept');
    if (!page) notFound();

    const safeHtml = page.contenu ? sanitizeRte(page.contenu) : null;

    return (
        <article className="max-w-2xl mx-auto px-6 py-section space-y-section">
            <header className="space-y-6">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Notre philosophie
                </p>
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                    {siteConfig.tagline}
                </h1>
            </header>

            {safeHtml && (
                <div
                    className="prose border-t border-border pt-section"
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
            )}
        </article>
    );
}
