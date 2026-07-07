import Link from 'next/link';
import { createGenre } from '@/lib/actions/genres';

export default function NouveauGenrePage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouveau genre
            </h1>
            <form action={createGenre} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Nom
                    </label>
                    <input
                        name="nom"
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Créer
                    </button>
                    <Link
                        href="/admin/genres"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    );
}
