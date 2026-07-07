import Link from 'next/link';
import { createPage } from '@/lib/actions/pages';

export default function NouvellePageEditorialePage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouvelle page éditoriale
            </h1>
            <form action={createPage} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Titre
                    </label>
                    <input
                        name="titre"
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Slug (URL : /votre-slug)
                    </label>
                    <input
                        name="slug"
                        required
                        pattern="[a-z0-9]+(-[a-z0-9]+)*"
                        placeholder="ex : livraison"
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground font-mono focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-muted">
                        Minuscules, chiffres et tirets uniquement.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Créer
                    </button>
                    <Link
                        href="/admin/pages"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    );
}
