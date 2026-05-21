import Link from 'next/link';
import { LivreCard } from '@/components/ui/LivreCard';
import type { LivreComplet } from '@/lib/queries/livres';

interface Props {
    titre: string;
    description: string;
    livres: LivreComplet[];
    href: string;
}

export function LivresSection({ titre, description, livres, href }: Props) {
    if (livres.length === 0) return null;

    return (
        <section className="py-section px-6 border-t border-border">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-end justify-between gap-6">
                    <div className="space-y-1.5">
                        <h2 className="font-serif text-[clamp(1.5rem,2.5vw,2rem)] font-bold text-foreground leading-[1.15] tracking-[-0.01em]">
                            {titre}
                        </h2>
                        <p className="text-sm text-muted">{description}</p>
                    </div>
                    <Link
                        href={href}
                        className="flex-none text-[11px] uppercase tracking-[0.1em] font-medium text-primary hover:text-foreground transition-colors whitespace-nowrap"
                    >
                        Voir plus &rarr;
                    </Link>
                </div>

                <div className="flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {livres.map((livre) => (
                        <div
                            key={livre.inventaireUri}
                            className="flex-none w-40 sm:w-44"
                        >
                            <LivreCard livre={livre} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
