import Link from 'next/link';
import { getBoutureCoverColor, DIFFICULTE_LABELS } from '@/lib/data';
import type { BouturePublique } from '@/lib/queries/boutures';

export function BoutureCard({
    bouture,
    featured = false,
}: {
    bouture: BouturePublique;
    featured?: boolean;
}) {
    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const difficulteLabel = bouture.difficulte ? DIFFICULTE_LABELS[bouture.difficulte] : undefined;

    return (
        <Link href={`/boutures/${bouture.slug}`} className="group block">
            <div
                className="aspect-2/3 w-full relative overflow-hidden"
                style={{ backgroundColor: coverColor }}
            >
                {featured && (
                    <div className="absolute top-3 right-3 bg-background border border-border px-2 py-1">
                        <p className="text-[7px] font-medium uppercase tracking-[0.12em] text-primary leading-tight text-right">
                            Choix de
                            <br />
                            la librairie
                        </p>
                    </div>
                )}
            </div>

            <div className="pt-3 space-y-1">
                {difficulteLabel && (
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                        {difficulteLabel}
                    </p>
                )}
                <h3 className="font-serif text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {bouture.nom}
                </h3>
                <p className="text-xs text-muted italic">{bouture.espece}</p>
                <p className="text-sm font-medium text-primary pt-1">
                    {bouture.prix} €
                </p>
                {bouture.stock === 0 && (
                    <p className="text-[9px] uppercase tracking-widest text-border">
                        Sur commande
                    </p>
                )}
            </div>
        </Link>
    );
}
