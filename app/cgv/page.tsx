import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Conditions Générales de Vente',
    robots: { index: false, follow: false },
};

export default function CGVPage() {
    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Conditions Générales de Vente
            </h1>
            <p className="text-muted">Contenu à venir.</p>
        </section>
    );
}
