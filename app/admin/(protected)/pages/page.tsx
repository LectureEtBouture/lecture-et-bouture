import Link from 'next/link';
import {
    getPagesList,
    togglePagePubliee,
    deletePage,
    getMissingFixedPages,
    createMissingFixedPages,
} from '@/lib/actions/pages';

const ROUTE_LABELS: Record<string, string> = {
    concept: 'Notre concept',
    'mentions-legales': 'Mentions légales',
    cgv: 'Conditions Générales de Vente',
    cgu: "Conditions Générales d'Utilisation",
    cookies: 'Politique de cookies',
    'politique-de-confidentialite': 'Politique de confidentialité',
};

// Pages liées à des routes front fixes — pas de suppression possible (voir deletePage).
const FIXED_SLUGS = Object.keys(ROUTE_LABELS);

export default async function AdminPagesPage() {
    const [pages, missingFixed] = await Promise.all([
        getPagesList(),
        getMissingFixedPages(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Pages éditoriales
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {pages.length} page{pages.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/pages/nouvelle"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>

            {missingFixed.length > 0 && (
                <div className="flex items-center justify-between gap-4 border border-amber-600/40 bg-amber-600/5 px-4 py-3">
                    <p className="text-[11px] text-foreground">
                        {missingFixed.length} page
                        {missingFixed.length > 1 ? 's' : ''} attendue
                        {missingFixed.length > 1 ? 's' : ''} par le site manque
                        {missingFixed.length > 1 ? 'nt' : ''} en base :{' '}
                        {missingFixed.map((page) => page.titre).join(', ')}.
                    </p>
                    <form action={createMissingFixedPages} className="contents">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors shrink-0"
                        >
                            Créer
                        </button>
                    </form>
                </div>
            )}
            <div className="divide-y divide-border">
                {pages.map((page) => (
                    <div
                        key={page.slug}
                        className="flex items-center justify-between py-4"
                    >
                        <div className="min-w-0 flex-1">
                            <Link
                                href={`/${page.slug}`}
                                target="_blank"
                                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                            >
                                {ROUTE_LABELS[page.slug] ?? page.titre}
                            </Link>
                            <p className="text-xs text-muted font-mono mt-0.5">
                                /{page.slug}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            <span
                                className={`text-[10px] uppercase tracking-widest ${page.contenu ? 'text-primary' : 'text-muted'}`}
                            >
                                {page.contenu ? 'Rédigée' : 'Vide'}
                            </span>
                            <form
                                action={async () => {
                                    'use server';
                                    await togglePagePubliee(page.slug);
                                }}
                                className="contents"
                            >
                                <button
                                    type="submit"
                                    className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border transition-colors leading-none ${page.publiee ? 'border-primary text-primary hover:bg-primary hover:text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`}
                                >
                                    {page.publiee ? 'Publiée' : 'Privée'}
                                </button>
                            </form>
                            <a
                                href={`/api/preview?secret=${process.env.PREVIEW_SECRET}&slug=${page.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-muted hover:text-primary transition-colors"
                            >
                                Aperçu
                            </a>
                            <Link
                                href={`/admin/pages/${page.slug}/modifier`}
                                className="text-xs text-muted hover:text-primary transition-colors"
                            >
                                Modifier
                            </Link>
                            {!FIXED_SLUGS.includes(page.slug) && (
                                <form
                                    action={deletePage.bind(null, page.slug)}
                                    className="contents"
                                >
                                    <button
                                        type="submit"
                                        className="text-xs text-muted hover:text-red-600 transition-colors"
                                    >
                                        Supprimer
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
