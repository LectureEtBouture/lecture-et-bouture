import { db } from '@/db';
import { selections, selectionItems, livres, plantes } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export type SelectionItemPublique =
    | {
          id: number;
          type: 'livre';
          ordre: number;
          titre: string;
          auteur: string;
          slug: string;
          prix: string;
          genreId: number | null;
      }
    | {
          id: number;
          type: 'plante';
          ordre: number;
          nom: string;
          espece: string | null;
          slug: string;
          prix: string;
          lumiere:
              | 'ombre'
              | 'mi-ombre'
              | 'lumiere-vive'
              | 'plein-soleil'
              | null;
      };

export type SelectionPublique = {
    id: number;
    titre: string;
    description: string | null;
    items: SelectionItemPublique[];
};

export async function getPublicSelections(): Promise<SelectionPublique[]> {
    const rows = await db
        .select({
            selectionId: selections.id,
            selectionTitre: selections.titre,
            selectionDescription: selections.description,
            itemId: selectionItems.id,
            itemType: selectionItems.type,
            itemOrdre: selectionItems.ordre,
            livreId: selectionItems.livreId,
            livreTitre: livres.titre,
            livreAuteur: livres.auteur,
            livreSlug: livres.slug,
            livrePrix: livres.prix,
            livreGenreId: livres.genreId,
            planteId: selectionItems.planteId,
            planteNom: plantes.nom,
            planteEspece: plantes.espece,
            planteSlug: plantes.slug,
            plantePrix: plantes.prix,
            planteLumiere: plantes.lumiere,
        })
        .from(selections)
        .leftJoin(selectionItems, eq(selectionItems.selectionId, selections.id))
        .leftJoin(livres, eq(selectionItems.livreId, livres.id))
        .leftJoin(plantes, eq(selectionItems.planteId, plantes.id))
        .where(eq(selections.active, true))
        .orderBy(
            asc(selections.ordre),
            asc(selections.createdAt),
            asc(selectionItems.ordre),
        );

    const map = new Map<number, SelectionPublique>();

    for (const row of rows) {
        if (!map.has(row.selectionId)) {
            map.set(row.selectionId, {
                id: row.selectionId,
                titre: row.selectionTitre,
                description: row.selectionDescription,
                items: [],
            });
        }

        const sel = map.get(row.selectionId)!;

        if (!row.itemId || !row.itemType) continue;

        if (
            row.itemType === 'livre' &&
            row.livreId &&
            row.livreTitre &&
            row.livreAuteur &&
            row.livreSlug &&
            row.livrePrix
        ) {
            sel.items.push({
                id: row.itemId,
                type: 'livre',
                ordre: row.itemOrdre ?? 0,
                titre: row.livreTitre,
                auteur: row.livreAuteur,
                slug: row.livreSlug,
                prix: row.livrePrix,
                genreId: row.livreGenreId ?? null,
            });
        } else if (
            row.itemType === 'plante' &&
            row.planteId &&
            row.planteNom &&
            row.planteSlug &&
            row.plantePrix
        ) {
            sel.items.push({
                id: row.itemId,
                type: 'plante',
                ordre: row.itemOrdre ?? 0,
                nom: row.planteNom,
                espece: row.planteEspece ?? null,
                slug: row.planteSlug,
                prix: row.plantePrix,
                lumiere: row.planteLumiere ?? null,
            });
        }
    }

    return Array.from(map.values());
}
