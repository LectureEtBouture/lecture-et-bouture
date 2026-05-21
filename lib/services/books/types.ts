export type LivreMetadata = {
    sourceId: string;
    titre: string | null;
    auteur: string | null;
    isbn: string | null;
    editeur: string | null;
    anneePublication: number | null;
    publishedDateRaw: string | null;
    serie: string | null;
    imageUrl: string | null;
    description: string | null;
    language: string | null;
    // champs optionnels — Google Books uniquement
    categories?: string[];
    previewLink?: string | null;
    isEbook?: boolean;
    prixNumerique?: number | null;
    nombrePages?: number | null;
};

export type LivreSearchResult = {
    uri: string;
    titre: string;
    description: string | null;
    imageUrl: string | null;
    // champs déjà disponibles dans la réponse de recherche — pas de call supplémentaire
    auteur: string | null;
    isbn: string | null;
    editeur: string | null;
    anneePublication: number | null;
    categories: string[];
    prixNumerique: number | null;
    isEbook: boolean;
};

export type EnrichissementLocal = {
    localId: string;
    inventaireUri: string;
    prix: string | null;
    choixLibrairie: boolean;
    noteDeLaLibrairie: string | null;
    rayonId: string | null;
    genreIds: string[];
    numeroSerie: number | null;
    noteMoyenne: string | null;
    image: string | null;
    imageAlt: string | null;
};

export type LivreComplet = {
    inventaireUri: string;
    slug: string;
    titre: string;
    auteur: string | null;
    isbn: string | null;
    editeur: string | null;
    anneePublication: number | null;
    publishedDateRaw: string | null;
    serie: string | null;
    imageUrl: string | null;
    imageAlt: string | null;
    description: string | null;
    language: string | null;
    categories: string[];
    previewLink: string | null;
    isEbook: boolean;
    prixNumerique: number | null;
    nombrePages: number | null;
    // enrichissement local (null = livre non enrichi par la librairie)
    localId: string | null;
    prix: string | null;
    choixLibrairie: boolean;
    noteDeLaLibrairie: string | null;
    rayonId: string | null;
    genreIds: string[];
    numeroSerie: number | null;
    noteMoyenne: string | null;
};

export interface BookProvider {
    rechercherParISBN(isbn: string): Promise<LivreMetadata | null>;
    rechercherParTitre(
        query: string,
        options?: {
            orderBy?: 'relevance' | 'newest';
            startIndex?: number;
            maxResults?: number;
        },
    ): Promise<LivreSearchResult[]>;
    rechercherParUri(uri: string): Promise<LivreMetadata | null>;
    rechercherParUris(uris: string[]): Promise<Map<string, LivreMetadata>>;
}
