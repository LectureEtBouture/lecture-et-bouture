import Link from 'next/link';
import { getCoverColor } from '@/lib/data';

type Tome = {
    id: number;
    slug: string;
    titre: string;
    genreIds?: number[];
    numeroSerie?: number | null;
};

export function AutresTomes({
    serie,
    tomes,
}: {
    serie: string;
    tomes: Tome[];
}) {
    if (tomes.length === 0) return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-muted">
                Autres tomes —{' '}
                <Link
                    href={`/livres?serie=${encodeURIComponent(serie)}`}
                    className="hover:text-primary transition-colors"
                >
                    {serie}
                </Link>
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {tomes.map((tome) => (
                    <Link
                        key={tome.id}
                        href={`/livres/${tome.slug}`}
                        className="group space-y-1"
                    >
                        <div
                            className="aspect-2/3 w-full relative overflow-hidden"
                            style={{
                                backgroundColor: getCoverColor(tome.genreIds?.[0]),
                            }}
                        >
                            <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest text-foreground/50">
                                T.{tome.numeroSerie}
                            </span>
                        </div>
                        <p className="text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {tome.titre}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
