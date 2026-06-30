import Link from 'next/link';
import { SmallCard } from '@/app/(front)/boutures/_components/BoutureBentoCard';
import type { BouturePublique } from '@/lib/queries/boutures';

interface Props {
    boutures: BouturePublique[];
}

export function BouturesSection({ boutures }: Props) {
    if (boutures.length === 0) return null;

    return (
        <section className="py-section px-6 border-t border-border">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-end justify-between gap-6">
                    <div className="space-y-1.5">
                        <h2 className="font-serif text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-foreground leading-[1.15] tracking-[-0.01em]">
                            Boutures
                        </h2>
                        <p className="text-sm text-muted">
                            Notre sélection de boutures et plantes rares.
                        </p>
                    </div>
                    <Link
                        href="/boutures"
                        className="flex-none text-[11px] uppercase tracking-[0.1em] font-medium text-primary hover:text-foreground transition-colors whitespace-nowrap"
                    >
                        Voir plus &rarr;
                    </Link>
                </div>

                <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {boutures.map((bouture) => (
                        <div
                            key={bouture.id}
                            className="flex-none w-40 sm:w-44"
                        >
                            <SmallCard bouture={bouture} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
