import Link from 'next/link';
import { getPagesList } from '@/lib/actions/pages';

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
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {ROUTE_LABELS[page.slug] ?? page.titre}
                            </p>
                            <p className="text-xs text-muted font-mono mt-0.5">
                                /{page.slug}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span
                                className={`text-[10px] uppercase tracking-widest ${page.contenu ? 'text-primary' : 'text-muted'}`}
                            >
                                {page.contenu ? 'Rédigée' : 'Vide'}
                            </span>
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
