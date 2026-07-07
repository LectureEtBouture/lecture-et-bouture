import { unstable_cache } from 'next/cache';
import { bookProvider, discoveryProvider } from '@/lib/services/books';
import { fusionner, fusionnerListe } from '@/lib/services/books/merge';
import { fetchOLDescriptionByISBN } from '@/lib/services/books/providers/inventaire-helpers';
import type {
    LivreComplet,
    EnrichissementLocal,
} from '@/lib/services/books/types';
import {
    getEnrichissements,
    getEnrichissementsCount,
    getChoixLibrairie,
    getEnrichissementByUri,
    type SortEnrichissements,
} from './enrichissements';
import { slugToUri } from '@/lib/services/books/slug';
import { bisacForRayon } from '@/lib/services/books/bisac';
import { suggestRayonSlug } from '@/lib/services/books/categories-fr';

export type { LivreComplet };

export type SortLivres =
    | 'alpha'
    | 'date'
    | 'note'
    | 'prix-asc'
    | 'prix-desc'
    | 'relevance'
    | 'newest';

export interface LivresFilters {
    rayonId?: string;
    rayonSlug?: string;
    genreId?: string;
    choixLibrairie?: boolean;
    q?: string;
    sort?: SortLivres;
    limit?: number;
    offset?: number;
    cat?: string;
    ebook?: boolean;
}

// Browse (no query): enriched books from local DB + inventaire batch fetch
export const getLivresPubliques = unstable_cache(
    async (filters: LivresFilters = {}): Promise<LivreComplet[]> => {
        if (filters.q) return getLivresSearch(filters.q, filters);

        const isAlpha = filters.sort === 'alpha';
        const enrichissements = await getEnrichissements({
            rayonId: filters.rayonId,
            rayonSlug: filters.rayonSlug,
            genreId: filters.genreId,
            choixLibrairie: filters.choixLibrairie,
            sort: isAlpha
                ? undefined
                : (filters.sort as SortEnrichissements | undefined),
            limit: isAlpha ? undefined : filters.limit,
            offset: isAlpha ? undefined : filters.offset,
        });

        if (enrichissements.length === 0) return [];

        const uris = enrichissements.map((e) => e.inventaireUri);
        const metas = await bookProvider.rechercherParUris(uris);
        const enrichMap = new Map<string, EnrichissementLocal>(
            enrichissements.map((e) => [e.inventaireUri, e]),
        );

        let result = fusionnerListe(metas, enrichMap, uris);

        if (isAlpha) {
            result = result.sort((a, b) =>
                a.titre.localeCompare(b.titre, 'fr'),
            );
            if (filters.limit !== undefined) {
                const off = filters.offset ?? 0;
                result = result.slice(off, off + filters.limit);
            }
        }

        return result;
    },
    ['livres-publiques'],
    { tags: ['livres'] },
);

// Search: Google Books live search + overlay enrichissements
// rechercherParTitre retourne déjà toutes les métadonnées nécessaires — pas besoin
// d'appeler rechercherParUris (N appels supplémentaires pour les mêmes données).
async function getLivresSearch(
    q: string,
    filters: LivresFilters,
): Promise<LivreComplet[]> {
    const orderBy = filters.sort === 'newest' ? 'newest' : 'relevance';
    const bisac = filters.rayonSlug ? bisacForRayon(filters.rayonSlug) : null;
    const queryWithBisac = bisac ? `${q} ${bisac}` : q;
    const offset = filters.offset ?? 0;
    const results = await bookProvider.rechercherParTitre(queryWithBisac, {
        orderBy,
        startIndex: offset,
        maxResults: 40,
    });
    if (results.length === 0) return [];

    const toMeta = (
        r: import('@/lib/services/books/types').LivreSearchResult,
    ): import('@/lib/services/books/types').LivreMetadata => ({
        sourceId: r.uri,
        titre: r.titre,
        auteur: r.auteur,
        isbn: r.isbn,
        editeur: r.editeur,
        anneePublication: r.anneePublication,
        publishedDateRaw: null,
        serie: null,
        imageUrl: r.imageUrl,
        description: r.description,
        language: null,
        categories: r.categories,
        previewLink: null,
        isEbook: r.isEbook,
        prixNumerique: r.prixNumerique,
        nombrePages: null,
    });

    const metas = new Map<
        string,
        import('@/lib/services/books/types').LivreMetadata
    >(results.map((r) => [r.uri, toMeta(r)]));

    // Expansion auteur: si peu de résultats physiques et un seul auteur domine,
    // compléter avec inauthor: pour retrouver les autres tomes d'une série.
    if (offset === 0 && !filters.rayonSlug && !bisac) {
        const physical = results.filter((r) => !r.isEbook);
        if (physical.length < 4 && physical.length >= 2) {
            const authorCounts = new Map<string, number>();
            for (const r of physical) {
                if (r.auteur)
                    authorCounts.set(
                        r.auteur,
                        (authorCounts.get(r.auteur) ?? 0) + 1,
                    );
            }
            const topEntry = [...authorCounts.entries()].sort(
                (a, b) => b[1] - a[1],
            )[0];
            if (topEntry && topEntry[1] >= 2) {
                const expanded = await bookProvider.rechercherParTitre(
                    `inauthor:"${topEntry[0]}"`,
                    { orderBy: 'relevance', startIndex: 0, maxResults: 40 },
                );
                for (const r of expanded) {
                    if (!metas.has(r.uri)) metas.set(r.uri, toMeta(r));
                }
            }
        }
    }

    const uris = [...metas.keys()];
    const enrichissements = await Promise.all(
        uris.map((uri) => getEnrichissementByUri(uri)),
    );
    const enrichMap = new Map<string, EnrichissementLocal>(
        uris
            .map((uri, i) => [uri, enrichissements[i]] as const)
            .filter(
                (pair): pair is [string, EnrichissementLocal] =>
                    pair[1] !== null,
            ),
    );

    let livres = fusionnerListe(metas, enrichMap, uris);

    if (filters.rayonId)
        livres = livres.filter((livre) => livre.rayonId === filters.rayonId);
    if (filters.genreId)
        livres = livres.filter((livre) =>
            livre.genreIds.includes(filters.genreId!),
        );
    if (filters.choixLibrairie)
        livres = livres.filter((livre) => livre.choixLibrairie);

    return livres;
}

export const getLivresCount = unstable_cache(
    async (filters: Omit<LivresFilters, 'limit' | 'offset'> = {}) => {
        if (filters.q) {
            const results = await getLivresSearch(filters.q, filters);
            return results.length;
        }
        return getEnrichissementsCount({
            rayonId: filters.rayonId,
            rayonSlug: filters.rayonSlug,
            genreId: filters.genreId,
            choixLibrairie: filters.choixLibrairie,
        });
    },
    ['livres-count'],
    { tags: ['livres'] },
);

export const getLivresMisEnAvant = unstable_cache(
    async (): Promise<LivreComplet[]> => {
        const enrichissements = await getChoixLibrairie();
        if (enrichissements.length === 0) return [];
        const uris = enrichissements.map((e) => e.inventaireUri);
        const metas = await bookProvider.rechercherParUris(uris);
        const enrichMap = new Map<string, EnrichissementLocal>(
            enrichissements.map((e) => [e.inventaireUri, e]),
        );
        return fusionnerListe(metas, enrichMap, uris);
    },
    ['livres-mis-en-avant'],
    { tags: ['livres'], revalidate: 1800 },
);

export async function getLivreBySlug(
    slug: string,
): Promise<LivreComplet | null> {
    const uri = slugToUri(slug);
    const [metaRaw, enrichissement] = await Promise.all([
        bookProvider.rechercherParUri(uri),
        getEnrichissementByUri(uri),
    ]);
    if (!metaRaw) return null;
    let meta = metaRaw;
    if (!meta.description && meta.isbn) {
        const desc = await fetchOLDescriptionByISBN(meta.isbn);
        if (desc) meta = { ...meta, description: desc };
    }
    return fusionner(meta, enrichissement);
}

export async function buildDiscoveryList(
    metas: import('@/lib/services/books/types').LivreMetadata[],
): Promise<LivreComplet[]> {
    const uris = metas.map((meta) => meta.sourceId);
    const enrichissements = await Promise.all(
        uris.map((uri) => getEnrichissementByUri(uri)),
    );
    const enrichMap = new Map<string, EnrichissementLocal>(
        uris
            .map((uri, i) => [uri, enrichissements[i]] as const)
            .filter(
                (pair): pair is [string, EnrichissementLocal] =>
                    pair[1] !== null,
            ),
    );
    return metas.map((meta) =>
        fusionner(meta, enrichMap.get(meta.sourceId) ?? null),
    );
}

export async function getLivresParCategorie(
    catSlug: string,
    startIndex = 0,
): Promise<LivreComplet[]> {
    const bisacQuery = bisacForRayon(catSlug) ?? catSlug;
    const metas = await discoveryProvider.rechercherParSujet(
        bisacQuery,
        startIndex,
    );
    if (metas.length === 0) return [];
    const uris = metas.map((meta) => meta.sourceId);
    const enrichissements = await Promise.all(
        uris.map((uri) => getEnrichissementByUri(uri)),
    );
    const enrichMap = new Map<string, EnrichissementLocal>(
        uris
            .map((uri, i) => [uri, enrichissements[i]] as const)
            .filter(
                (pair): pair is [string, EnrichissementLocal] =>
                    pair[1] !== null,
            ),
    );
    return metas.map((meta) =>
        fusionner(meta, enrichMap.get(meta.sourceId) ?? null),
    );
}

export const getLivresTendances = unstable_cache(
    async (startIndex = 0): Promise<LivreComplet[]> => {
        const metas = await discoveryProvider.rechercherTendances(startIndex);
        return buildDiscoveryList(metas);
    },
    ['livres-tendances'],
    { tags: ['discovery'], revalidate: 1800 },
);

export const getLivresNouveautes = unstable_cache(
    async (startIndex = 0): Promise<LivreComplet[]> => {
        const metas = await discoveryProvider.rechercherNouveautes(startIndex);
        return buildDiscoveryList(metas);
    },
    ['livres-nouveautes'],
    { tags: ['discovery'], revalidate: 1800 },
);

export const getLivresParSujet = unstable_cache(
    async (query: string): Promise<LivreComplet[]> => {
        const metas = await discoveryProvider.rechercherParSujet(query);
        return buildDiscoveryList(metas);
    },
    ['livres-par-sujet'],
    { tags: ['discovery'], revalidate: 1800 },
);

export async function getMemeAuteur(
    auteur: string,
    excludeUri: string,
    limit = 4,
): Promise<LivreComplet[]> {
    const metas = await discoveryProvider.rechercherParSujet(
        `inauthor:"${auteur}"`,
    );
    const filtered = metas
        .filter((meta) => meta.sourceId !== excludeUri)
        .slice(0, limit);
    return buildDiscoveryList(filtered);
}

export async function getMemeCategorie(
    categories: string[],
    excludeUri: string,
    limit = 4,
): Promise<LivreComplet[]> {
    const rayonSlug = suggestRayonSlug(categories);
    if (!rayonSlug) return [];
    const query = bisacForRayon(rayonSlug);
    if (!query) return [];
    const metas = await discoveryProvider.rechercherParSujet(query);
    const filtered = metas
        .filter((meta) => meta.sourceId !== excludeUri)
        .slice(0, limit);
    return buildDiscoveryList(filtered);
}
