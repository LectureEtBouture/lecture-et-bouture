import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation",
    robots: { index: false, follow: false },
};

export default function CGUPage() {
    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Conditions Générales d&apos;Utilisation
            </h1>
            <p className="text-muted">Contenu à venir.</p>
        </section>
    );
}
