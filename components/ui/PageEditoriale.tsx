import { notFound } from 'next/navigation';
import { fetchPageEditorialeWithDraft } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export async function PageEditoriale({
    slug,
    title,
}: {
    slug: string;
    title: string;
}) {
    const page = await fetchPageEditorialeWithDraft(slug);
    if (!page) notFound();

    // safeHtml is sanitized by sanitizeRte (sanitize-html) — no XSS risk
    const safeHtml = page.contenu ? sanitizeRte(page.contenu) : null;

    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">{title}</h1>
            {safeHtml ? (
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
            ) : (
                <p className="text-muted">Contenu à venir.</p>
            )}
        </section>
    );
}
