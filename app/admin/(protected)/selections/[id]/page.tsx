import { notFound } from 'next/navigation';
import {
    getSelectionWithItems,
    addSelectionItem,
} from '@/lib/actions/selections';
import { getPlantes } from '@/lib/actions/plantes';
import { bookProvider } from '@/lib/services/books';
import { SelectionItemsSortable } from './_components/SelectionItemsSortable';
import { SelectionAddLivre } from './_components/SelectionAddLivre';
import { inputClass, labelClass } from '@/components/admin/formStyles';

export default async function SelectionItemsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [{ selection, items }, plantesList] = await Promise.all([
        getSelectionWithItems(id),
        getPlantes(),
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

            <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted">
                        Items ({items.length})
                    </h2>
                    {items.length > 1 && (
                        <span className="text-[11px] text-muted/60">
                            ↕ Glissez pour réordonner
                        </span>
                    )}
                </div>
                <SelectionItemsSortable
                    key={[...items]
                        .sort((a, b) => a.ordre - b.ordre)
                        .map((item) => item.id)
                        .join(',')}
                    selectionId={id}
                    initial={items}
                    livresMeta={livresMeta}
                />
            </section>

            <section className="space-y-6">
                <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted border-b border-border pb-2">
                    Ajouter
                </h2>

                <div className="space-y-2 max-w-md">
                    <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground">
                        Livre
                    </p>
                    <p className="text-[11px] text-muted">
                        Recherche par titre ou auteur — cliquer sur un résultat
                        pour l&apos;ajouter directement.
                    </p>
                    <SelectionAddLivre selectionId={id} />
                </div>

                <div className="space-y-3 pt-2 border-t border-border max-w-sm">
                    <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground pt-2">
                        Bouture
                    </p>
                    {plantesList.length === 0 ? (
                        <p className="text-[11px] text-muted">
                            Aucune bouture disponible.
                        </p>
                    ) : (
                        <form
                            action={async (formData: FormData) => {
                                'use server';
                                const itemId = formData.get('itemId') as string;
                                if (!itemId) return;
                                await addSelectionItem(id, 'plante', itemId);
                            }}
                            className="flex items-end gap-3"
                        >
                            <div className="space-y-1 flex-1 min-w-0">
                                <label className={labelClass}>Spécimen</label>
                                <select name="itemId" className={inputClass}>
                                    {plantesList.map((plante) => (
                                        <option
                                            key={plante.id}
                                            value={plante.id}
                                        >
                                            {plante.nom}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-primary text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors shrink-0"
                            >
                                Ajouter
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
