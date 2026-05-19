import Link from 'next/link';
import { getSelections } from '@/lib/actions/selections';
import { SelectionsSortable } from './_components/SelectionsSortable';

export default async function AdminSelectionsPage() {
    const data = await getSelections();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Sélections
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        Mises en avant sur le site, affichées dans l&apos;ordre
                        ci-dessous.
                    </p>
                </div>
                <Link
                    href="/admin/selections/nouvelle"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Créer
                </Link>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted py-4">
                    Aucune sélection pour l&apos;instant.
                </p>
            ) : (
                <>
                    <p className="text-[11px] text-muted flex items-center gap-2">
                        <span>↕</span>
                        Glissez pour modifier l&apos;ordre d&apos;affichage sur
                        le site.
                    </p>
                    <SelectionsSortable
                        initial={data.map((s) => ({
                            id: s.id,
                            titre: s.titre,
                            active: s.active,
                            itemCount: s.itemCount,
                        }))}
                    />
                </>
            )}
        </div>
    );
}
