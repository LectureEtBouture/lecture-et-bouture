import Link from 'next/link';
import { getCoverColor } from '@/lib/data';
import type { LivreComplet } from '@/lib/services/books/types';
import { CoverImage } from '@/components/ui/CoverImage';

export function LivreCard({
    livre,
    featured = false,
    genreNom,
}: {
    livre: LivreComplet;
    featured?: boolean;
    genreNom?: string;
}) {
    const coverColor = getCoverColor(livre.genreIds?.[0]);

    return (
        <Link href={`/livres/${livre.slug}`} className="group block">
            <div
                className="aspect-book w-full relative overflow-hidden"
                style={{ backgroundColor: coverColor }}
            >
                {livre.imageUrl && (
                    <CoverImage
                        src={livre.imageUrl}
                        alt={livre.imageAlt ?? livre.titre}
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                )}
                {livre.numeroSerie && (
                    <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-foreground/50 drop-shadow-sm">
                        Tome {livre.numeroSerie}
                    </span>
                )}
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
                {genreNom && (
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                        {genreNom}
                    </p>
                )}
                <h3 className="font-serif text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {livre.titre}
                </h3>
                <p className="text-xs text-muted">{livre.auteur}</p>
                {livre.prix && (
                    <p className="text-sm font-medium text-primary pt-1">
                        {livre.prix} €{' '}
                        <span className="text-[10px] text-muted font-normal">
                            indicatif
                        </span>
                    </p>
                )}
            </div>
        </Link>
    );
}
