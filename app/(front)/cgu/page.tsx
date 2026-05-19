import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageEditoriale } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation",
    robots: { index: false, follow: false },
};

export default async function CGUPage() {
    const page = await getPageEditoriale('cgu');
    if (!page) notFound();

    const safeHtml = page.contenu ? sanitizeRte(page.contenu) : null;

    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Conditions Générales d&apos;Utilisation
            </h1>
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
