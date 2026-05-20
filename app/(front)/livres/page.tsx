import type { Metadata } from 'next';
import {
    getLivresPubliques,
    getLivresCount,
    getLivresMisEnAvant,
    type SortLivres,
} from '@/lib/queries/livres';
import {
    getLivresRayons,
    getGenresActifs,
    getLivresSeries,
    getLivresEditeurs,
    getLivresFormats,
} from '@/lib/queries/livres-facets';
import { FilterBar } from './_components/FilterBar';
import { SearchBar } from './_components/SearchBar';
import { LivreCard } from '@/components/ui/LivreCard';
import { LivresGrid } from './_components/LivresGrid';
import { VusRecemment } from '@/components/ui/VusRecemment';

export const metadata: Metadata = {
    title: 'Livres',
    description: 'Parcourez notre sélection de livres soignés.',
};

const PAGE_SIZE = 24;

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LivresPage({ searchParams }: Props) {
    const params = await searchParams;

    const rayonId = params.rayon ?? undefined;
    const genreId = params.genre ?? undefined;
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

    const activeFilters = {
        rayon: rayonId,
        genre: genreId,
        serie,
        editeur,
        format,
        sort,
        q,
        choixLibrairie,
    };

    const [
        livresList,
        livresTotal,
        misEnAvant,
        rayons,
        genresList,
        series,
        editeurs,
        formats,
    ] = await Promise.all([
        getLivresPubliques({ ...activeFilters, limit: PAGE_SIZE, offset: 0 }),
        getLivresCount({
            rayon: rayonId,
            genre: genreId,
            serie,
            editeur,
            format,
            q,
            choixLibrairie,
        }),
        isFiltered ? Promise.resolve([]) : getLivresMisEnAvant(),
        getLivresRayons(),
        getGenresActifs(rayonId),
        getLivresSeries(),
        getLivresEditeurs(),
        getLivresFormats(),
    ]);

    const gridKey = `${rayonId}-${genreId}-${serie}-${editeur}-${format}-${sort}-${q}-${choixLibrairie}`;

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">
                Livres
            </h1>

            <VusRecemment />

            <SearchBar value={q ?? ''} />

            <FilterBar
                rayons={rayons}
                genres={genresList}
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
                        {livresTotal} titre
                        {livresTotal !== 1 ? 's' : ''}
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
                    {livresList.length === 0 ? (
                        <p className="text-sm text-muted">Aucun résultat.</p>
                    ) : (
                        <LivresGrid
                            key={gridKey}
                            initialItems={livresList}
                            filters={activeFilters}
                            genresList={genresList}
                        />
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
                                        genreNom={
                                            genresList.find(
                                                (genre) =>
                                                    genre.id ===
                                                    livre.genreIds?.[0],
                                            )?.nom
                                        }
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
                                {livresTotal} titre
                                {livresTotal !== 1 ? 's' : ''}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <LivresGrid
                            key={gridKey}
                            initialItems={livresList}
                            filters={activeFilters}
                            genresList={genresList}
                        />
                    </section>
                </div>
            )}
        </div>
    );
}
