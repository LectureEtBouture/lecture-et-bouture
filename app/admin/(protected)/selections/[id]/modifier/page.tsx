import { notFound } from 'next/navigation';
import { getSelections, updateSelection } from '@/lib/actions/selections';

export default async function ModifierSelectionPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const all = await getSelections();
    const selection = all.find((s) => s.id === Number(id));

    if (!selection) notFound();

    const action = updateSelection.bind(null, selection.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier — {selection.titre}
            </h1>
            <form action={action} className="space-y-5 max-w-xl">
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Titre *
                    </label>
                    <input
                        name="titre"
                        defaultValue={selection.titre}
                        required
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Description
                    </label>
                    <textarea
                        name="description"
                        defaultValue={selection.description ?? ''}
                        rows={3}
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors resize-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs uppercase tracking-widest text-muted">
                            Ordre
                        </label>
                        <input
                            name="ordre"
                            type="number"
                            defaultValue={selection.ordre}
                            className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                        />
                    </div>
                    <div className="space-y-1 flex items-end">
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                            <input
                                name="active"
                                type="checkbox"
                                defaultChecked={selection.active}
                                className="accent-[#2D4B3E]"
                            />
                            Active
                        </label>
                    </div>
                </div>
                <button
                    type="submit"
                    className="px-6 py-2 bg-[#2D4B3E] text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors"
                >
                    Enregistrer
                </button>
            </form>
        </div>
    );
}
