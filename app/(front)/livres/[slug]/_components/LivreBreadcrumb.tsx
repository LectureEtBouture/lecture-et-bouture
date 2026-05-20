import Link from 'next/link';

type LivreRef = {
    rayonId?: string | null;
    genreIds?: string[];
    serie?: string | null;
    numeroSerie?: number | null;
};

export function LivreBreadcrumb({
    livre,
    genre,
    rayon,
}: {
    livre: LivreRef;
    genre?: { nom: string; id: string };
    rayon?: { nom: string };
}) {
    return (
        <nav className="flex items-center gap-2 text-xs text-muted">
            <Link
                href="/livres"
                className="hover:text-primary transition-colors"
            >
                Livres
            </Link>
            {rayon && (
                <>
                    <span>·</span>
                    <Link
                        href={`/livres?rayon=${livre.rayonId}`}
                        className="hover:text-primary transition-colors"
                    >
                        {rayon.nom}
                    </Link>
                </>
            )}
            {genre && (
                <>
                    <span>·</span>
                    <Link
                        href={`/livres?genre=${livre.genreIds?.[0]}`}
                        className="hover:text-primary transition-colors"
                    >
                        {genre.nom}
                    </Link>
                </>
            )}
            {livre.serie && (
                <>
                    <span>·</span>
                    <Link
                        href={`/livres?serie=${encodeURIComponent(livre.serie)}`}
                        className="hover:text-primary transition-colors"
                    >
                        {livre.serie}
                    </Link>
                </>
            )}
        </nav>
    );
}
