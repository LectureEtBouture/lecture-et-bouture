import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politique de confidentialité',
    robots: { index: false, follow: false },
};

export default function PolitiqueConfidentialitePage() {
    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Politique de confidentialité
            </h1>
            <p className="text-muted">Contenu à venir.</p>
        </section>
    );
}
