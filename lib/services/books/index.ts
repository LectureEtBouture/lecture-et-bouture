import { InventaireProvider } from './providers/inventaire';
import { WikidataProvider } from './providers/wikidata';
import type { BookProvider } from './types';

const providers: Record<string, BookProvider> = {
    inventaire: new InventaireProvider(),
    wikidata: new WikidataProvider(),
};

export const bookProvider: BookProvider =
    providers[process.env.BOOK_PROVIDER ?? 'inventaire'] ??
    new InventaireProvider();

export type { BookProvider, LivreMetadata } from './types';
