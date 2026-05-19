import type { GenreFacette } from '@/lib/queries/livres-facets';
import { pill, pillHighlight } from '@/components/ui/filter';

export function GenreFilter({
    genres,
    activeGenreId,
    activeChoixLibrairie,
    push,
}: {
    genres: GenreFacette[];
    activeGenreId?: number;
    activeChoixLibrairie?: boolean;
    push: (updates: Record<string, string | undefined>) => void;
}) {
    return (
        <div className="space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
                <button
                    onClick={() =>
                        push({ choix: activeChoixLibrairie ? undefined : '1' })
                    }
                    className={pillHighlight(!!activeChoixLibrairie)}
                >
                    Choix de la librairie
                </button>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] uppercase tracking-widest text-muted w-14 shrink-0">
                    Genre
                </span>
                <button
                    onClick={() => push({ genre: undefined })}
                    className={pill(!activeGenreId)}
                >
                    Tous
                </button>
                {genres.map((genre) => (
                    <button
                        key={genre.id}
                        onClick={() => push({ genre: String(genre.id) })}
                        className={pill(activeGenreId === genre.id)}
                    >
                        {genre.nom}
                    </button>
                ))}
            </div>
        </div>
    );
}
