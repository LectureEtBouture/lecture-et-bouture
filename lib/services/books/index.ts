import { InventaireProvider } from './providers/inventaire';
import { WikidataProvider } from './providers/wikidata';
import { GoogleBooksProvider } from './providers/google-books';
import type { BookProvider } from './types';

// Public provider — Google Books (browse + search + discovery)
export const discoveryProvider = new GoogleBooksProvider();
export const bookProvider: BookProvider = discoveryProvider;

// Import provider — Google Books par défaut (couverture FR fiable, strip tirets ISBN auto)
// BOOK_IMPORT_PROVIDER=inventaire ou wikidata pour forcer un autre provider
export const importProvider: BookProvider =
    process.env.BOOK_IMPORT_PROVIDER === 'inventaire'
        ? new InventaireProvider()
        : process.env.BOOK_IMPORT_PROVIDER === 'wikidata'
          ? new WikidataProvider()
          : new GoogleBooksProvider();

export type { BookProvider, LivreMetadata, LivreComplet, LivreSearchResult, EnrichissementLocal } from './types';
export { uriToSlug, slugToUri, uriToISBN } from './slug';
export { fusionner, fusionnerListe } from './merge';
