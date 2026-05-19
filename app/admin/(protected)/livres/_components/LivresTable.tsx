import Link from 'next/link';
import { deleteLivre } from '@/lib/actions/livres';
import type { getLivres } from '@/lib/actions/livres';

type LivreRow = Awaited<ReturnType<typeof getLivres>>[number];

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

export function LivresTable({ data }: { data: LivreRow[] }) {
    if (data.length === 0) {
        return (
            <p className="text-sm text-muted py-8 text-center">
                Aucun livre pour l&apos;instant.
            </p>
        );
    }

    return (
        <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-border/50">
                {data.map((livre) => (
                    <div key={livre.id} className="py-3 space-y-2">
                        <div>
                            <p className="text-sm font-medium text-foreground leading-snug">
                                {livre.titre}
                            </p>
                            <p className="text-xs text-muted mt-0.5">
                                {livre.auteur}
                            </p>
                            {livre.choixLibrairie && (
                                <span className="text-[10px] uppercase tracking-[0.08em] text-primary block mt-0.5">
                                    Choix librairie
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm tabular-nums text-foreground">
                                {livre.prix} €
                            </span>
                            <ActionLinks
                                modifier={`/admin/livres/${livre.id}/modifier`}
                                onDelete={async () => {
                                    'use server';
                                    await deleteLivre(livre.id);
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
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-[35%]">
                                Titre
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden md:table-cell">
                                Auteur
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden lg:table-cell">
                                Rayon
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
                        {data.map((livre) => (
                            <tr
                                key={livre.id}
                                className="border-b border-border/50 hover:bg-white transition-colors"
                            >
                                <td className="py-3 pr-4">
                                    <p className="font-medium text-foreground leading-snug">
                                        {livre.titre}
                                    </p>
                                    {livre.choixLibrairie && (
                                        <span className="text-[10px] uppercase tracking-[0.08em] text-primary">
                                            Choix librairie
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 pr-4 text-muted hidden md:table-cell">
                                    {livre.auteur}
                                </td>
                                <td className="py-3 pr-4 text-muted hidden lg:table-cell">
                                    {livre.rayonNom ?? livre.genreNom ?? '—'}
                                </td>
                                <td className="py-3 pr-4 text-foreground tabular-nums">
                                    {livre.prix} €
                                </td>
                                <td className="py-3 pr-4 text-muted tabular-nums hidden xl:table-cell">
                                    {livre.stock}
                                </td>
                                <td className="py-3 pl-4 text-right whitespace-nowrap">
                                    <ActionLinks
                                        modifier={`/admin/livres/${livre.id}/modifier`}
                                        onDelete={async () => {
                                            'use server';
                                            await deleteLivre(livre.id);
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
