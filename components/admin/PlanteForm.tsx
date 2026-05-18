import type { InferSelectModel } from 'drizzle-orm';
import type { plantes } from '@/db/schema';

type Plante = InferSelectModel<typeof plantes>;

interface Props {
    action: (formData: FormData) => Promise<void>;
    plante?: Plante;
}

export function PlanteForm({ action, plante }: Props) {
    return (
        <form action={action} className="space-y-5 max-w-xl">
            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Nom *
                </label>
                <input
                    name="nom"
                    defaultValue={plante?.nom}
                    required
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Espèce
                    </label>
                    <input
                        name="espece"
                        defaultValue={plante?.espece ?? ''}
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Famille
                    </label>
                    <input
                        name="famille"
                        defaultValue={plante?.famille ?? ''}
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Prix (€) *
                </label>
                <input
                    name="prix"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={plante?.prix ?? ''}
                    required
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Difficulté
                    </label>
                    <select
                        name="difficulte"
                        defaultValue={plante?.difficulte ?? ''}
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    >
                        <option value="">—</option>
                        <option value="facile">Facile</option>
                        <option value="moyen">Moyen</option>
                        <option value="difficile">Difficile</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Lumière
                    </label>
                    <select
                        name="lumiere"
                        defaultValue={plante?.lumiere ?? ''}
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    >
                        <option value="">—</option>
                        <option value="ombre">Ombre</option>
                        <option value="mi-ombre">Mi-ombre</option>
                        <option value="lumiere-vive">Lumière vive</option>
                        <option value="plein-soleil">Plein soleil</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-xs uppercase tracking-widest text-muted">
                        Arrosage
                    </label>
                    <select
                        name="arrosage"
                        defaultValue={plante?.arrosage ?? ''}
                        className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors"
                    >
                        <option value="">—</option>
                        <option value="rare">Rare</option>
                        <option value="modere">Modéré</option>
                        <option value="regulier">Régulier</option>
                        <option value="abondant">Abondant</option>
                    </select>
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Description
                </label>
                <textarea
                    name="description"
                    defaultValue={plante?.description ?? ''}
                    rows={4}
                    className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-[#2D4B3E] transition-colors resize-none"
                />
            </div>

            <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest text-muted">
                    Conseils d&apos;entretien
                </label>
                <textarea
                    name="conseilsEntretien"
                    defaultValue={plante?.conseilsEntretien ?? ''}
                    rows={4}
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
