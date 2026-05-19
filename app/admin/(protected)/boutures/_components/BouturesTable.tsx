import Link from 'next/link';
import { deletePlante } from '@/lib/actions/plantes';
import type { getPlantes } from '@/lib/actions/plantes';

type BoutureRow = Awaited<ReturnType<typeof getPlantes>>[number];

const DIFFICULTE_LABEL: Record<string, string> = {
    facile: 'Facile',
    moyen: 'Moyen',
    difficile: 'Difficile',
};
const LUMIERE_LABEL: Record<string, string> = {
    ombre: 'Ombre',
    'mi-ombre': 'Mi-ombre',
    'lumiere-vive': 'Lumière vive',
    'plein-soleil': 'Plein soleil',
};

const actionCls = 'text-xs text-muted hover:text-primary transition-colors';
const dangerCls = 'text-xs text-muted hover:text-red-600 transition-colors';

function ActionLinks({
    modifier: modifierHref,
    onDelete,
}: {
    modifier: string;
    onDelete: () => Promise<void>;
}) {
    return (
        <div className="flex items-center gap-4">
            <Link href={modifierHref} className={actionCls}>
                Modifier
            </Link>
            <form action={onDelete} className="contents">
                <button type="submit" className={dangerCls}>
                    Supprimer
                </button>
            </form>
        </div>
    );
}

export function BouturesTable({ data }: { data: BoutureRow[] }) {
    if (data.length === 0) {
        return (
            <p className="text-sm text-muted py-8 text-center">
                Aucune bouture pour l&apos;instant.
            </p>
        );
    }

    return (
        <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-border/50">
                {data.map((bouture) => (
                    <div key={bouture.id} className="py-3 space-y-2">
                        <div>
                            <p className="text-sm font-medium text-foreground leading-snug">
                                {bouture.nom}
                            </p>
                            {bouture.espece && (
                                <p className="text-xs text-muted italic mt-0.5">
                                    {bouture.espece}
                                </p>
                            )}
                            <div className="flex gap-2 mt-0.5 flex-wrap">
                                {bouture.difficulte && (
                                    <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                                        {DIFFICULTE_LABEL[bouture.difficulte]}
                                    </span>
                                )}
                                {bouture.choixLibrairie && (
                                    <span className="text-[10px] uppercase tracking-[0.08em] text-primary">
                                        Choix librairie
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm tabular-nums text-foreground">
                                {bouture.prix} €
                            </span>
                            <ActionLinks
                                modifier={`/admin/boutures/${bouture.id}/modifier`}
                                onDelete={async () => {
                                    'use server';
                                    await deletePlante(bouture.id);
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-[30%]">
                                Nom
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden md:table-cell">
                                Espèce
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden md:table-cell">
                                Difficulté
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden lg:table-cell">
                                Lumière
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                Prix
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden xl:table-cell">
                                Stock
                            </th>
                            <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((bouture) => (
                            <tr
                                key={bouture.id}
                                className="border-b border-border/50 hover:bg-white transition-colors px-4"
                            >
                                <td className="py-3 pr-4">
                                    <p className="font-medium text-foreground">
                                        {bouture.nom}
                                    </p>
                                    {bouture.choixLibrairie && (
                                        <span className="text-[10px] uppercase tracking-[0.08em] text-primary">
                                            Choix librairie
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 pr-4 text-muted italic hidden md:table-cell">
                                    {bouture.espece ?? '—'}
                                </td>
                                <td className="py-3 pr-4 text-muted hidden md:table-cell">
                                    {bouture.difficulte
                                        ? DIFFICULTE_LABEL[bouture.difficulte]
                                        : '—'}
                                </td>
                                <td className="py-3 pr-4 text-muted hidden lg:table-cell">
                                    {bouture.lumiere
                                        ? LUMIERE_LABEL[bouture.lumiere]
                                        : '—'}
                                </td>
                                <td className="py-3 pr-4 text-foreground tabular-nums">
                                    {bouture.prix} €
                                </td>
                                <td className="py-3 pr-4 text-muted tabular-nums hidden xl:table-cell">
                                    {bouture.stock}
                                </td>
                                <td className="py-3 pl-4 text-right whitespace-nowrap">
                                    <ActionLinks
                                        modifier={`/admin/boutures/${bouture.id}/modifier`}
                                        onDelete={async () => {
                                            'use server';
                                            await deletePlante(bouture.id);
                                        }}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
