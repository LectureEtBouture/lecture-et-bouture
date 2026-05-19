import Link from 'next/link';
import { getLivres, getRayons, type LivresSort } from '@/lib/actions/livres';
import { LivresSortFilter } from './_components/LivresSortFilter';
import { LivresTable } from './_components/LivresTable';

function buildHref(params: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v) q.set(k, v);
    }
    const qs = q.toString();
    return qs ? `/admin/livres?${qs}` : '/admin/livres';
}

const VALID_SORTS: LivresSort[] = [
    'recent',
    'titre',
    'auteur',
    'prix',
    'stock',
];

export default async function AdminLivresPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string; choix?: string; rayon?: string }>;
}) {
    const { sort: sortParam, choix: choixParam, rayon } = await searchParams;
    const sort = (VALID_SORTS as string[]).includes(sortParam ?? '')
        ? (sortParam as LivresSort)
        : 'recent';
    const choix = choixParam === '1';

    const [data, rayonsList] = await Promise.all([
        getLivres(sort, { choix: choix || undefined, rayon }),
        getRayons(),
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Livres
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} entrée{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/livres/nouveau"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>
            <LivresSortFilter
                sort={sort}
                choix={choix}
                rayon={rayon}
                rayonsList={rayonsList}
                buildHref={buildHref}
            />
            <LivresTable data={data} />
        </div>
    );
}
