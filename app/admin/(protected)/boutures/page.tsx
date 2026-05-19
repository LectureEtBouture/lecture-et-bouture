import Link from 'next/link';
import { getPlantes, type PlantesSort } from '@/lib/actions/plantes';
import { BoutureSortFilter } from './_components/BoutureSortFilter';
import { BouturesTable } from './_components/BouturesTable';

function buildHref(params: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v) q.set(k, v);
    }
    const qs = q.toString();
    return qs ? `/admin/boutures?${qs}` : '/admin/boutures';
}

const VALID_SORTS: PlantesSort[] = [
    'recent',
    'nom',
    'prix',
    'stock',
    'difficulte',
];
const VALID_DIFFICULTES = ['facile', 'moyen', 'difficile'];

export default async function AdminBouturesPage({
    searchParams,
}: {
    searchParams: Promise<{
        sort?: string;
        choix?: string;
        difficulte?: string;
    }>;
}) {
    const {
        sort: sortParam,
        choix: choixParam,
        difficulte: difficulteParam,
    } = await searchParams;
    const sort = (VALID_SORTS as string[]).includes(sortParam ?? '')
        ? (sortParam as PlantesSort)
        : 'recent';
    const choix = choixParam === '1';
    const difficulte = VALID_DIFFICULTES.includes(difficulteParam ?? '')
        ? (difficulteParam as 'facile' | 'moyen' | 'difficile')
        : undefined;

    const data = await getPlantes(sort, {
        choix: choix || undefined,
        difficulte,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Boutures
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} entrée{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/boutures/nouveau"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>
            <BoutureSortFilter
                sort={sort}
                choix={choix}
                difficulte={difficulte}
                buildHref={buildHref}
            />
            <BouturesTable data={data} />
        </div>
    );
}
