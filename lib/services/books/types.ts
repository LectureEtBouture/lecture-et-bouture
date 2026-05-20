export type LivreMetadata = {
    sourceId: string;
    titre: string | null;
    auteur: string | null;
    editeur: string | null;
    anneePublication: number | null;
    serie: string | null;
    imageUrl: string | null;
    description: string | null;
};

export interface BookProvider {
    rechercherParISBN(isbn: string): Promise<LivreMetadata | null>;
}
