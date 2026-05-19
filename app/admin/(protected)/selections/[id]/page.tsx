import { notFound } from 'next/navigation';
import {
    getSelectionWithItems,
    addSelectionItem,
} from '@/lib/actions/selections';
import { getLivres } from '@/lib/actions/livres';
import { getPlantes } from '@/lib/actions/plantes';
import { SelectionItemsSortable } from './_components/SelectionItemsSortable';
import { inputClass, labelClass } from '@/components/admin/formStyles';

export default async function SelectionItemsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const selectionId = Number(id);
    const { selection, items } = await getSelectionWithItems(selectionId);
    if (!selection) notFound();
    const [livresList, plantesList] = await Promise.all([
        getLivres(),
        getPlantes(),
    ]);

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
                        .sort((a, b) => a.id - b.id)
                        .map((item) => item.id)
                        .join(',')}
                    selectionId={selectionId}
                    initial={items}
                />
            </section>

            <section className="space-y-4">
                <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted border-b border-border pb-2">
                    Ajouter un item
                </h2>
                <form
                    action={async (formData: FormData) => {
                        'use server';
                        const type = formData.get('type') as 'livre' | 'plante';
                        const itemId = Number(formData.get('itemId'));
                        if (!type || !itemId) return;
                        await addSelectionItem(selectionId, type, itemId);
                    }}
                    className="space-y-4 max-w-sm"
                >
                    <div className="space-y-1">
                        <label className={labelClass}>Type</label>
                        <select name="type" className={inputClass}>
                            <option value="livre">Livre</option>
                            <option value="plante">Bouture</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className={labelClass}>Choisir</label>
                        <select name="itemId" className={inputClass}>
                            <optgroup label="Livres">
                                {livresList.map((livre) => (
                                    <option
                                        key={`l-${livre.id}`}
                                        value={livre.id}
                                    >
                                        {livre.titre}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Boutures">
                                {plantesList.map((plante) => (
                                    <option
                                        key={`p-${plante.id}`}
                                        value={plante.id}
                                    >
                                        {plante.nom}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors"
                    >
                        Ajouter
                    </button>
                </form>
            </section>
        </div>
    );
}
