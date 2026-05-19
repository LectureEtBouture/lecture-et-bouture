import { notFound } from 'next/navigation';
import { getPage, updatePage } from '@/lib/actions/pages';
import { RtePageForm } from '@/components/admin/RtePageForm';

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
            <RtePageForm
                action={action}
                defaultValue={page.contenu ?? ''}
                backHref="/admin/pages"
            />
        </div>
    );
}
