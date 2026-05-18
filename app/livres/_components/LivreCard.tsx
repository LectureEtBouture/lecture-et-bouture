import Link from 'next/link';
import { getCoverColor, getGenreById, type Livre } from '@/lib/data';

export function LivreCard({
    livre,
    featured = false,
}: {
    livre: Livre;
    featured?: boolean;
}) {
    const genre = getGenreById(livre.genreId ?? 0);
    const coverColor = getCoverColor(livre.genreId);

    return (
        <Link href={`/livres/${livre.slug}`} className="group block">
            <div
                className="aspect-2/3 w-full relative overflow-hidden"
                style={{ backgroundColor: coverColor }}
            >
                {livre.numeroSerie && (
                    <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-foreground/50">
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
                {genre && (
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                        {genre.nom}
                    </p>
                )}
                <h3 className="font-serif text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {livre.titre}
                </h3>
                <p className="text-xs text-muted">{livre.auteur}</p>
                <p className="text-sm font-medium text-primary pt-1">
                    {livre.prix} €
                </p>
                {livre.stock === 0 && (
                    <p className="text-[9px] uppercase tracking-widest text-border">
                        Sur commande
                    </p>
                )}
            </div>
        </Link>
    );
}
