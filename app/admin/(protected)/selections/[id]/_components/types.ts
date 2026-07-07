export type SelectionItem = {
    id: string;
    type: string;
    livreUri: string | null;
    planteNom: string | null;
    articleId: string | null;
    articleTitre: string | null;
    articleImage: string | null;
};

export type LivreMeta = {
    titre: string | null;
    auteur: string | null;
    imageUrl: string | null;
};

// Item local (non enregistré) : soit un item existant chargé depuis le serveur,
// soit un ajout en attente qui n'a pas encore d'id réel (créé au moment d'Enregistrer).
export type LocalItem =
    | {
          kind: 'existing';
          id: string;
          type: string;
          livreUri: string | null;
          planteNom: string | null;
          articleId: string | null;
          articleTitre: string | null;
          articleImage: string | null;
      }
    | {
          kind: 'pending-livre';
          tempId: string;
          uri: string;
          titre: string | null;
          imageUrl: string | null;
          auteur: string | null;
      }
    | { kind: 'pending-plante'; tempId: string; planteId: string; planteNom: string }
    | {
          kind: 'pending-article';
          tempId: string;
          articleId: string;
          titre: string;
          imageUrl: string | null;
      };

export function localItemKey(item: LocalItem): string {
    return item.kind === 'existing' ? item.id : item.tempId;
}
