import Link from 'next/link';

export function SurprendreSection() {
    return (
        <section className="bg-surface border-t border-border py-section px-6">
            <div className="max-w-xl mx-auto text-center space-y-8">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Vous hésitez encore
                </p>
                <h2 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-foreground leading-[1.15] tracking-[-0.01em]">
                    Laissez la libraire
                    <br />
                    choisir pour vous.
                </h2>
                <p className="text-base text-muted leading-[1.75] max-w-[48ch] mx-auto">
                    Un livre parmi nos coups de coeur, tiré au sort par notre
                    équipe. Pas d&rsquo;algorithme. Pas de bestseller. Un
                    conseil sincère.
                </p>
                <Link
                    href="/surprendre"
                    className="inline-block bg-primary text-background px-10 py-3.5 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors duration-200 hover:bg-primary-light"
                >
                    Me faire surprendre
                </Link>
            </div>
        </section>
    );
}
