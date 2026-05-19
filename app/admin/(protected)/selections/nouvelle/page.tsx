import { createSelection } from '@/lib/actions/selections';
import { inputClass, labelClass } from '@/components/admin/formStyles';

export default function NouvelleSelectionPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouvelle sélection
            </h1>
            <form action={createSelection} className="space-y-5 max-w-xl">
                <div className="space-y-1">
                    <label className={labelClass}>Titre *</label>
                    <input name="titre" required className={inputClass} />
                </div>
                <div className="space-y-1">
                    <label className={labelClass}>Description</label>
                    <textarea
                        name="description"
                        rows={3}
                        className={`${inputClass} resize-none`}
                    />
                </div>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input
                        name="active"
                        type="checkbox"
                        className="accent-primary"
                    />
                    Publique (visible sur le site)
                </label>
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors"
                >
                    Créer
                </button>
            </form>
        </div>
    );
}
