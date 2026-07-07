import { db } from '@/db';
import {
    selections,
    selectionItems,
    livres,
    plantes,
    articles,
} from '@/db/schema';
import { eq, asc, sql } from 'drizzle-orm';
import { bookProvider } from '@/lib/services/books';
import { uriToSlug } from '@/lib/services/books/slug';

export type SelectionItemPublique =
    | {
          id: string;
          type: 'livre';
          ordre: number;
          titre: string;
          auteur: string | null;
          slug: string;
          prix: string | null;
          primaryGenreId: string | null;
      }
    | {
          id: string;
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
      }
    | {
          id: string;
          type: 'article';
          ordre: number;
          titre: string;
          slug: string;
          image: string | null;
      };

export type SelectionPublique = {
    id: string;
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
            livreUri: livres.inventaireUri,
            livrePrix: livres.prix,
            livreGenreId: sql<
                string | null
            >`(SELECT genre_id FROM livres_genres WHERE livre_id = ${livres.id} ORDER BY genre_id LIMIT 1)`,
            planteId: selectionItems.planteId,
            planteNom: plantes.nom,
            planteEspece: plantes.espece,
            planteSlug: plantes.slug,
            plantePrix: plantes.prix,
            planteLumiere: plantes.lumiere,
            articleId: selectionItems.articleId,
            articleTitre: articles.titre,
            articleSlug: articles.slug,
            articleImage: articles.image,
            articlePublie: articles.publie,
        })
        .from(selections)
        .leftJoin(selectionItems, eq(selectionItems.selectionId, selections.id))
        .leftJoin(livres, eq(selectionItems.livreId, livres.id))
        .leftJoin(plantes, eq(selectionItems.planteId, plantes.id))
        .leftJoin(articles, eq(selectionItems.articleId, articles.id))
        .where(eq(selections.active, true))
        .orderBy(
            asc(selections.ordre),
            asc(selections.createdAt),
            asc(selectionItems.ordre),
        );

    // Collect unique livre URIs to batch-fetch metadata
    const livreUris = [
        ...new Set(
            rows
                .filter((row) => row.itemType === 'livre' && row.livreUri)
                .map((row) => row.livreUri!),
        ),
    ];

    const livresMeta =
        livreUris.length > 0
            ? await bookProvider.rechercherParUris(livreUris)
            : new Map();

    const map = new Map<string, SelectionPublique>();

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

        if (row.itemType === 'livre' && row.livreId && row.livreUri) {
            const meta = livresMeta.get(row.livreUri);
            sel.items.push({
                id: row.itemId,
                type: 'livre',
                ordre: row.itemOrdre ?? 0,
                titre: meta?.titre ?? row.livreUri,
                auteur: meta?.auteur ?? null,
                slug: uriToSlug(row.livreUri),
                prix: row.livrePrix,
                primaryGenreId: row.livreGenreId ?? null,
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
        } else if (
            row.itemType === 'article' &&
            row.articleId &&
            row.articleTitre &&
            row.articleSlug &&
            row.articlePublie
        ) {
            sel.items.push({
                id: row.itemId,
                type: 'article',
                ordre: row.itemOrdre ?? 0,
                titre: row.articleTitre,
                slug: row.articleSlug,
                image: row.articleImage ?? null,
            });
        }
    }

    return Array.from(map.values());
}
