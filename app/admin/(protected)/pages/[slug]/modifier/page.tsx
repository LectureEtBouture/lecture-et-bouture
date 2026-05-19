import { notFound } from 'next/navigation';
import { getPage, updatePage } from '@/lib/actions/pages';
import { RteField } from '@/components/admin/RteField';
import { labelClass } from '@/components/admin/formStyles';

type Props = { params: Promise<{ slug: string }> };

const ROUTE_LABELS: Record<string, string> = {
    concept: 'Notre concept',
    'mentions-legales': 'Mentions légales',
    cgv: 'Conditions Générales de Vente',
    cgu: "Conditions Générales d'Utilisation",
    cookies: 'Politique de cookies',
    'politique-de-confidentialite': 'Politique de confidentialité',
};

export default async function ModifierPagePage({ params }: Props) {
    const { slug } = await params;
    const page = await getPage(slug);
    if (!page) notFound();

    const action = updatePage.bind(null, page.slug);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    {ROUTE_LABELS[page.slug] ?? page.titre}
                </h1>
                <p className="text-[11px] text-muted font-mono mt-1">
                    /{page.slug}
                </p>
            </div>
            <form action={action} className="space-y-6">
                <div>
                    <label className={labelClass}>Contenu</label>
                    <RteField
                        name="contenu"
                        defaultValue={page.contenu ?? ''}
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Enregistrer
                    </button>
                    <a
                        href="/admin/pages"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
