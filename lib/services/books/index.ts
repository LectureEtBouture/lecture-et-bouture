import { InventaireProvider } from './providers/inventaire';
import { WikidataProvider } from './providers/wikidata';
import { GoogleBooksProvider } from './providers/google-books';
import type { BookProvider, LivreMetadata } from './types';

// Public provider — Google Books (browse + search + discovery)
export const discoveryProvider = new GoogleBooksProvider();

// Résolution d'URI par préfixe : les livres importés via Inventaire.io (BOOK_IMPORT_PROVIDER=inventaire)
// sont stockés avec un inventaire_uri "inv:<hash>" que Google Books ne sait pas résoudre — sans ce
// routage, ces livres sont enrichis en BDD mais invisibles partout côté public (silencieusement
// exclus par fusionnerListe faute de métadonnées).
const inventaireProvider = new InventaireProvider();

export const bookProvider: BookProvider = {
    rechercherParISBN: (isbn) => discoveryProvider.rechercherParISBN(isbn),
    rechercherParTitre: (query, options) =>
        discoveryProvider.rechercherParTitre(query, options),
    rechercherParUri: (uri) =>
        uri.startsWith('isbn:') || uri.startsWith('gbid:')
            ? discoveryProvider.rechercherParUri(uri)
            : inventaireProvider.rechercherParUri(uri),
    async rechercherParUris(uris) {
        const googleUris = uris.filter(
            (uri) => uri.startsWith('isbn:') || uri.startsWith('gbid:'),
        );
        const inventaireUris = uris.filter(
            (uri) => !googleUris.includes(uri),
        );
        const [googleResults, inventaireResults] = await Promise.all([
            discoveryProvider.rechercherParUris(googleUris),
            inventaireProvider.rechercherParUris(inventaireUris),
        ]);
        const result = new Map<string, LivreMetadata>(googleResults);
        for (const [uri, meta] of inventaireResults) result.set(uri, meta);
        return result;
    },
};

// Import provider — Google Books par défaut (couverture FR fiable, strip tirets ISBN auto)
// BOOK_IMPORT_PROVIDER=inventaire ou wikidata pour forcer un autre provider
export const importProvider: BookProvider =
    process.env.BOOK_IMPORT_PROVIDER === 'inventaire'
        ? new InventaireProvider()
        : process.env.BOOK_IMPORT_PROVIDER === 'wikidata'
          ? new WikidataProvider()
          : new GoogleBooksProvider();

export type {
    BookProvider,
    LivreMetadata,
    LivreComplet,
    LivreSearchResult,
    EnrichissementLocal,
} from './types';
export { uriToSlug, slugToUri, uriToISBN } from './slug';
export { fusionner, fusionnerListe } from './merge';
