import { createSelection } from '@/lib/actions/selections';

export default function NouvelleSelectionPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouvelle sélection
            </h1>
            <form action={createSelection} className="space-y-5 max-w-xl">
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Titre *
                    </label>
                    <input
                        name="titre"
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
                            defaultValue="0"
                            className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                        />
                    </div>
                    <div className="space-y-1 flex items-end">
                        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                            <input
                                name="active"
                                type="checkbox"
                                defaultChecked
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
                    Créer
                </button>
            </form>
        </div>
    );
}
