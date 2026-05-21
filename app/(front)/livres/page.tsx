import type { Metadata } from 'next';
import {
    getLivresPubliques,
    getLivresCount,
    getLivresMisEnAvant,
    getLivresTendances,
    getLivresNouveautes,
    getLivresParCategorie,
    type SortLivres,
} from '@/lib/queries/livres';
import { getLivresRayons, getGenresActifs } from '@/lib/queries/livres-facets';
import { FilterBar } from './_components/FilterBar';
import { SearchBar } from './_components/SearchBar';
import { LivreCard } from '@/components/ui/LivreCard';
import { LivresGrid } from './_components/LivresGrid';
import { LivresDecouverte } from './_components/LivresDecouverte';
import { VusRecemment } from '@/components/ui/VusRecemment';

export const metadata: Metadata = {
    title: 'Livres',
    description: 'Parcourez notre sélection de livres soignés.',
};

const PAGE_SIZE_CATALOGUE = 24;
const PAGE_SIZE_SEARCH = 8;

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

export default async function LivresPage({ searchParams }: Props) {
    const params = await searchParams;

    const rayonSlug = params.rayon ?? undefined;
    const genreId = params.genre ?? undefined;
    const sort = (params.sort as SortLivres) ?? undefined;
    const q = params.q ?? undefined;
    const choixLibrairie = params.choix === '1' ? true : undefined;
    const cat = params.cat ?? undefined;
    const showEbook = params.ebook === '1';

    const isFiltered = !!(q || rayonSlug || genreId || choixLibrairie);
    const isCatBrowse = !!cat && !isFiltered && !q;
    const isGoogleSort = sort === 'relevance' || sort === 'newest';
    const isDiscovery = !isFiltered && !isCatBrowse && (!sort || isGoogleSort);
    const discoveryView = !sort
        ? 'both'
        : sort === 'newest'
          ? 'nouveautes'
          : 'tendances';

    const activeFilters = {
        rayonSlug,
        genreId,
        sort,
        q,
        choixLibrairie,
        cat,
        ebook: showEbook,
    };

    const pageSize = q ? PAGE_SIZE_SEARCH : PAGE_SIZE_CATALOGUE;

    const filterEbooks = <T extends { isEbook: boolean }>(list: T[]) =>
        showEbook ? list : list.filter((item) => !item.isEbook);

    const [
        livresListRaw,
        livresTotal,
        misEnAvantRaw,
        tendancesRaw,
        nouveautesRaw,
        rayons,
        genresList,
    ] = await Promise.all([
        isCatBrowse
            ? getLivresParCategorie(cat!)
            : isDiscovery
              ? Promise.resolve([])
              : getLivresPubliques({
                    ...activeFilters,
                    limit: pageSize,
                    offset: 0,
                }),
        // Pour les recherches texte (q), on ne fait pas un 2e appel API juste pour le count —
        // livresList.length est utilisé après le filtre ebook (null → fallback sur .length).
        isCatBrowse || q
            ? Promise.resolve(null)
            : isDiscovery
              ? Promise.resolve(0)
              : getLivresCount({ rayonSlug, genreId, q, choixLibrairie }),
        isDiscovery ? getLivresMisEnAvant() : Promise.resolve([]),
        isDiscovery && discoveryView !== 'nouveautes'
            ? getLivresTendances()
            : Promise.resolve([]),
        isDiscovery && discoveryView !== 'tendances'
            ? getLivresNouveautes()
            : Promise.resolve([]),
        getLivresRayons(),
        getGenresActifs(),
    ]);

    const livresList = filterEbooks(livresListRaw);
    const misEnAvant = filterEbooks(misEnAvantRaw);
    const tendances = filterEbooks(tendancesRaw);
    const nouveautes = filterEbooks(nouveautesRaw);

    const gridKey = `${rayonSlug ?? ''}-${genreId ?? ''}-${sort ?? ''}-${q ?? ''}-${String(choixLibrairie)}-${cat ?? ''}`;

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
                activeRayonId={rayonSlug}
                activeGenreId={genreId}
                activeSort={sort}
                activeChoixLibrairie={!!choixLibrairie}
                activeCat={cat}
                activeEbook={showEbook}
            />

            {isCatBrowse ? (
                <div className="space-y-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted">
                        {livresList.length} titre
                        {livresList.length !== 1 ? 's' : ''} trouvés
                    </p>
                    {livresList.length === 0 ? (
                        <p className="text-sm text-muted">Aucun résultat.</p>
                    ) : (
                        <LivresGrid
                            key={gridKey}
                            initialItems={livresList}
                            filters={activeFilters}
                            genresList={genresList}
                            pageSize={40}
                        />
                    )}
                </div>
            ) : isDiscovery ? (
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
                                        key={livre.inventaireUri}
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
                    <LivresDecouverte
                        tendances={tendances}
                        nouveautes={nouveautes}
                        genresList={genresList}
                        view={discoveryView}
                        showEbook={showEbook}
                    />
                </div>
            ) : isFiltered ? (
                <div className="space-y-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted">
                        {livresTotal ?? livresList.length} titre
                        {(livresTotal ?? livresList.length) !== 1 ? 's' : ''}
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
                            pageSize={pageSize}
                        />
                    )}
                </div>
            ) : (
                <div className="space-y-14">
                    <section className="space-y-6">
                        <div className="flex items-baseline gap-4">
                            <h2 className="font-serif text-xl font-bold text-foreground">
                                Tout le catalogue
                            </h2>
                            <span className="text-xs uppercase tracking-widest text-muted">
                                {livresTotal ?? livresList.length} titre
                                {(livresTotal ?? livresList.length) !== 1
                                    ? 's'
                                    : ''}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <LivresGrid
                            key={gridKey}
                            initialItems={livresList}
                            filters={activeFilters}
                            genresList={genresList}
                            pageSize={pageSize}
                        />
                    </section>
                </div>
            )}
            <p className="text-sm text-muted text-center pt-4">
                Vous ne trouvez pas ce que vous cherchez ?{' '}
                <a
                    href="https://www.leslibraires.fr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-primary transition-colors"
                >
                    Consultez leslibraires.fr
                </a>
            </p>
        </div>
    );
}
