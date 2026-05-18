import type { InferSelectModel } from 'drizzle-orm';
import type { livres, genres } from '@/db/schema';

type Livre = InferSelectModel<typeof livres>;
type Genre = InferSelectModel<typeof genres>;

interface Props {
    action: (formData: FormData) => Promise<void>;
    livre?: Livre;
    genresList: Genre[];
}

export function LivreForm({ action, livre, genresList }: Props) {
    return (
        <form action={action} className="space-y-5 max-w-xl">
            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Titre *
                </label>
                <input
                    name="titre"
                    defaultValue={livre?.titre}
                    required
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Auteur *
                </label>
                <input
                    name="auteur"
                    defaultValue={livre?.auteur}
                    required
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Prix (€) *
                    </label>
                    <input
                        name="prix"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={livre?.prix ?? ''}
                        required
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        ISBN
                    </label>
                    <input
                        name="isbn"
                        defaultValue={livre?.isbn ?? ''}
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Genre
                </label>
                <select
                    name="genreId"
                    defaultValue={livre?.genreId ?? ''}
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                >
                    <option value="">— Aucun —</option>
                    {genresList.map((g) => (
                        <option key={g.id} value={g.id}>
                            {g.nom}
                        </option>
                    ))}
                </select>
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Description
                </label>
                <textarea
                    name="description"
                    defaultValue={livre?.description ?? ''}
                    rows={5}
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors resize-none"
                />
            </div>

            <button
                type="submit"
                className="px-6 py-2 bg-[#2D4B3E] text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors"
            >
                Enregistrer
            </button>
        </form>
    );
}
