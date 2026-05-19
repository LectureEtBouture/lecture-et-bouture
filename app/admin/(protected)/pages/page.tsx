import Link from 'next/link';
import { getPagesList, togglePagePubliee } from '@/lib/actions/pages';

const ROUTE_LABELS: Record<string, string> = {
    concept: 'Notre concept',
    'mentions-legales': 'Mentions légales',
    cgv: 'Conditions Générales de Vente',
    cgu: "Conditions Générales d'Utilisation",
    cookies: 'Politique de cookies',
    'politique-de-confidentialite': 'Politique de confidentialité',
};

export default async function AdminPagesPage() {
    const pages = await getPagesList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Pages éditoriales
                </h1>
                <p className="text-[11px] text-muted mt-0.5">
                    {pages.length} page{pages.length > 1 ? 's' : ''}
                </p>
            </div>
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
                            <Link
                                href={`/admin/pages/${page.slug}/modifier`}
                                className="text-xs text-muted hover:text-primary transition-colors"
                            >
                                Modifier
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
