import type { Metadata } from 'next';
import {
    getLivres,
    getLivresMisEnAvant,
    getGenresActifs,
    getLivresRayons,
    getLivresSeries,
    getLivresEditeurs,
    getLivresFormats,
    type SortLivres,
} from '@/lib/data';
import { FilterBar } from './_components/FilterBar';
import { SearchBar } from './_components/SearchBar';
import { LivreCard } from './_components/LivreCard';

export const metadata: Metadata = {
    title: 'Livres',
    description: 'Parcourez notre sélection de livres soignés.',
};

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LivresPage({ searchParams }: Props) {
    const params = await searchParams;

    const rayonId = params.rayon ? Number(params.rayon) : undefined;
    const genreId = params.genre ? Number(params.genre) : undefined;
    const serie = params.serie ?? undefined;
    const editeur = params.editeur ?? undefined;
    const format = params.format ?? undefined;
    const sort = (params.sort as SortLivres) ?? undefined;
    const q = params.q ?? undefined;
    const choixLibrairie = params.choix === '1' ? true : undefined;

    const isFiltered = !!(
        q ||
        rayonId ||
        genreId ||
        serie ||
        editeur ||
        format ||
        choixLibrairie
    );

    const livres = getLivres({
        rayon: rayonId,
        genre: genreId,
        serie,
        editeur,
        format,
        sort,
        q,
        choixLibrairie,
    });
    const misEnAvant = isFiltered ? [] : getLivresMisEnAvant();

    const rayons = getLivresRayons();
    const genres = getGenresActifs(rayonId);
    const series = getLivresSeries();
    const editeurs = getLivresEditeurs();
    const formats = getLivresFormats();

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">
                Livres
            </h1>

            <SearchBar value={q ?? ''} />

            <FilterBar
                rayons={rayons}
                genres={genres}
                series={series}
                editeurs={editeurs}
                formats={formats}
                activeRayonId={rayonId}
                activeGenreId={genreId}
                activeSerie={serie}
                activeEditeur={editeur}
                activeFormat={format}
                activeSort={sort}
                activeChoixLibrairie={!!choixLibrairie}
            />

            {isFiltered ? (
                <div className="space-y-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted">
                        {livres.length} titre{livres.length !== 1 ? 's' : ''}
                        {q && (
                            <>
                                {' '}
                                pour{' '}
                                <em className="not-italic font-medium text-foreground">
                                    &#34;{q}&#34;
                                </em>
                            </>
                        )}
                    </p>
                    {livres.length === 0 ? (
                        <p className="text-sm text-muted">Aucun résultat.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {livres.map((livre) => (
                                <LivreCard key={livre.id} livre={livre} />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-14">
                    {misEnAvant.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-baseline gap-4">
                                <h2 className="font-serif text-xl font-bold text-foreground">
                                    Choix de la librairie
                                </h2>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {misEnAvant.map((livre) => (
                                    <LivreCard
                                        key={livre.id}
                                        livre={livre}
                                        featured
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="space-y-6">
                        <div className="flex items-baseline gap-4">
                            <h2 className="font-serif text-xl font-bold text-foreground">
                                Tout le catalogue
                            </h2>
                            <span className="text-xs uppercase tracking-widest text-muted">
                                {livres.length} titre
                                {livres.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {livres.map((livre) => (
                                <LivreCard key={livre.id} livre={livre} />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
