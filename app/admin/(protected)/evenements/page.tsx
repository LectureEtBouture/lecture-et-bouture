import Link from 'next/link';
import { getEvenements, type EvenementsFilter, type EvenementsSort } from '@/lib/actions/evenements';
import { EvenementsFilters } from './_components/EvenementsFilters';
import { EvenementRowMobile, EvenementRowDesktop } from './_components/EvenementRow';

const VALID_FILTERS: EvenementsFilter[] = ['tous', 'a-venir', 'en-cours', 'passes'];
const VALID_SORTS: EvenementsSort[] = ['date-asc', 'date-desc'];

export default async function AdminEvenementsPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string; sort?: string }>;
}) {
    const { filter: fp, sort: sp } = await searchParams;

    const filter: EvenementsFilter = (VALID_FILTERS as string[]).includes(fp ?? '') ? (fp as EvenementsFilter) : 'tous';
    const sort: EvenementsSort = (VALID_SORTS as string[]).includes(sp ?? '') ? (sp as EvenementsSort) : 'date-asc';

    const data = await getEvenements(filter, sort);
    const now = new Date();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">Événements</h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} événement{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/evenements/nouveau"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>

            <EvenementsFilters filter={filter} sort={sort} />

            {data.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">Aucun événement dans cette catégorie.</p>
            ) : (
                <>
                    <div className="sm:hidden divide-y divide-border/50">
                        {data.map((evenement) => (
                            <EvenementRowMobile key={evenement.id} evenement={evenement} now={now} />
                        ))}
                    </div>

                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-[38%]">Titre</th>
                                    <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">Date</th>
                                    <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden md:table-cell">Lieu</th>
                                    <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">État</th>
                                    <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((evenement) => (
                                    <EvenementRowDesktop key={evenement.id} evenement={evenement} now={now} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
