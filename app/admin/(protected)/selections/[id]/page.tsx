import { notFound } from 'next/navigation';
import { getSelectionWithItems } from '@/lib/actions/selections';
import { getPlantes } from '@/lib/actions/plantes';
import { getLivres } from '@/lib/actions/livres';
import { getArticlesAdmin } from '@/lib/queries/articles';
import { bookProvider } from '@/lib/services/books';
import { SelectionManager } from './_components/SelectionManager';

export default async function SelectionItemsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [{ selection, items }, plantesList, livresEnrichisRaw, articlesRaw] =
        await Promise.all([
            getSelectionWithItems(id),
            getPlantes(),
            getLivres('recent'),
            getArticlesAdmin(),
        ]);
    if (!selection) notFound();

    const livreUris = items
        .filter((item) => item.type === 'livre' && item.livreUri)
        .map((item) => item.livreUri as string);
    const livresMeta =
        livreUris.length > 0
            ? await bookProvider.rechercherParUris(livreUris)
            : new Map<
                  string,
                  {
                      titre: string | null;
                      auteur: string | null;
                      imageUrl: string | null;
                  }
              >();

    const livresEnrichis = livresEnrichisRaw.map((livre) => ({
        inventaireUri: livre.inventaireUri,
        titre: livre.titre,
        image: livre.image,
        choixLibrairie: livre.choixLibrairie,
    }));

    const articlesList = articlesRaw.map((article) => ({
        id: article.id,
        titre: article.titre,
        image: article.image,
        publie: article.publie,
    }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    {selection.titre}
                </h1>
                <p className="text-[11px] text-muted mt-0.5 uppercase tracking-widest">
                    Gestion des items
                </p>
            </div>

            <SelectionManager
                key={[...items]
                    .sort((a, b) => a.ordre - b.ordre)
                    .map((item) => item.id)
                    .join(',')}
                selectionId={id}
                initialItems={items}
                livresMeta={livresMeta}
                livresEnrichis={livresEnrichis}
                plantesList={plantesList}
                articlesList={articlesList}
            />
        </div>
    );
}
