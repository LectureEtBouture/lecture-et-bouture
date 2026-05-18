import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Concept',
    description:
        "Découvrez la philosophie Lecture & Boutures — l'alliance du livre et du vivant.",
};

export default function ConceptPage() {
    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-4xl text-primary">Notre Concept</h1>
            <p className="mt-6 text-foreground/80 leading-relaxed">
                Contenu à venir.
            </p>
        </section>
    );
}
