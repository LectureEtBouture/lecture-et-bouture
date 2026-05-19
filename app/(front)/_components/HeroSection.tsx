import Image from 'next/image';
import { siteConfig } from '@/lib/metadata';

export function HeroSection() {
    return (
        <section className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)]">
            <div className="relative lg:w-[62%] h-72 sm:h-96 lg:h-auto">
                <Image
                    src="/hero.jpg"
                    alt="L'espace Lecture & Boutures — livres et plantes sous le même toit"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1024px) 100vw, 62vw"
                />
            </div>
            <div className="lg:w-[38%] bg-background flex items-center px-8 py-14 lg:px-14 xl:px-20">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-10">
                        Livres & Boutures
                    </p>
                    <h1 className="font-serif text-[clamp(2.5rem,3.5vw,4rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em] mb-6">
                        {siteConfig.tagline}
                    </h1>
                    <p className="text-base text-muted leading-[1.75] max-w-[42ch]">
                        Une librairie indépendante. Des boutures rares. Un
                        conservateur qui choisit pour vous.
                    </p>
                </div>
            </div>
        </section>
    );
}
