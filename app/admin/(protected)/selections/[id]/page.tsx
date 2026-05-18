import { notFound } from 'next/navigation';
import {
    getSelectionWithItems,
    removeSelectionItem,
    addSelectionItem,
} from '@/lib/actions/selections';
import { getLivres } from '@/lib/actions/livres';
import { getPlantes } from '@/lib/actions/plantes';

export default async function SelectionItemsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [{ selection, items }, livresList, plantesList] = await Promise.all([
        getSelectionWithItems(Number(id)),
        getLivres(),
        getPlantes(),
    ]);

    if (!selection) notFound();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    {selection.titre}
                </h1>
                <p className="text-xs text-muted mt-1 uppercase tracking-widest">
                    Gestion des items
                </p>
            </div>

            <section className="space-y-3">
                <h2 className="text-xs uppercase tracking-widest text-muted">
                    Items ({items.length})
                </h2>
                {items.length === 0 && (
                    <p className="text-sm text-muted">
                        Aucun item dans cette sélection.
                    </p>
                )}
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white border border-border px-4 py-3 flex items-center justify-between"
                    >
                        <p className="text-sm text-foreground">
                            <span className="text-xs uppercase tracking-widest text-muted mr-2">
                                {item.type}
                            </span>
                            {item.type === 'livre'
                                ? item.livreTitre
                                : item.planteNom}
                        </p>
                        <form
                            action={async () => {
                                'use server';
                                await removeSelectionItem(item.id);
                            }}
                        >
                            <button
                                type="submit"
                                className="text-xs text-muted hover:text-red-600 transition-colors"
                            >
                                Retirer
                            </button>
                        </form>
                    </div>
                ))}
            </section>

            <section className="space-y-4">
                <h2 className="text-xs uppercase tracking-widest text-muted">
                    Ajouter un item
                </h2>
                <form
                    action={async (formData: FormData) => {
                        'use server';
                        const type = formData.get('type') as 'livre' | 'plante';
                        const itemId = Number(formData.get('itemId'));
                        const ordre = Number(formData.get('ordre') ?? 0);
                        if (!type || !itemId) return;
                        await addSelectionItem(Number(id), type, itemId, ordre);
                    }}
                    className="space-y-4 max-w-sm"
                >
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-muted">
                            Type
                        </label>
                        <select
                            name="type"
                            className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                        >
                            <option value="livre">Livre</option>
                            <option value="plante">Plante</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-muted">
                            Livre
                        </label>
                        <select
                            name="itemId"
                            className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                        >
                            <optgroup label="Livres">
                                {livresList.map((l) => (
                                    <option key={`l-${l.id}`} value={l.id}>
                                        {l.titre}
                                    </option>
                                ))}
                            </optgroup>
                            <optgroup label="Plantes">
                                {plantesList.map((p) => (
                                    <option key={`p-${p.id}`} value={p.id}>
                                        {p.nom}
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-muted">
                            Ordre
                        </label>
                        <input
                            name="ordre"
                            type="number"
                            defaultValue={items.length}
                            className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                        />
                    </div>

                    <button
                        type="submit"
                        className="px-6 py-2 bg-[#2D4B3E] text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors"
                    >
                        Ajouter
                    </button>
                </form>
            </section>
        </div>
    );
}
