export type SelectionItem = {
    id: string;
    type: string;
    livreUri: string | null;
    planteNom: string | null;
};

export type LivreMeta = {
    titre: string | null;
    auteur: string | null;
    imageUrl: string | null;
};
