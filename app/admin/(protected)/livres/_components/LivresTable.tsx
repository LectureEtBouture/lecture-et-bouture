import Link from 'next/link';
import { deleteLivre } from '@/lib/actions/livres';
import type { getLivres } from '@/lib/actions/livres';
import type { LivreMetadata } from '@/lib/services/books/types';

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

function LivreIdentite({
    livre,
    meta,
}: {
    livre: LivreRow;
    meta: Pick<LivreMetadata, 'titre' | 'imageUrl'> | undefined;
}) {
    return (
        <div className="flex items-center gap-3 min-w-0">
            {meta?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={meta.imageUrl}
                    alt=""
                    className="w-8 h-11 object-cover shrink-0 rounded-sm"
                />
            ) : (
                <div className="w-8 h-11 bg-surface border border-border shrink-0 rounded-sm" />
            )}
            <div className="min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug truncate">
                    {livre.titre ?? meta?.titre ?? '—'}
                </p>
                <p className="text-[11px] text-muted font-mono truncate">
                    {livre.inventaireUri}
                </p>
                {livre.choixLibrairie && (
                    <span className="text-[10px] uppercase tracking-[0.08em] text-primary">
                        Choix librairie
                    </span>
                )}
            </div>
        </div>
    );
}

export function LivresTable({
    data,
    bookMetas,
}: {
    data: LivreRow[];
    bookMetas: Map<string, Pick<LivreMetadata, 'titre' | 'imageUrl'>>;
}) {
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
                        <LivreIdentite
                            livre={livre}
                            meta={bookMetas.get(livre.inventaireUri)}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-sm tabular-nums text-muted">
                                {livre.prix ? `${livre.prix} €` : '—'}
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
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                Livre
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                Prix
                            </th>
                            <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden lg:table-cell">
                                Note moy.
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
                                    <LivreIdentite
                                        livre={livre}
                                        meta={bookMetas.get(
                                            livre.inventaireUri,
                                        )}
                                    />
                                </td>
                                <td className="py-3 pr-4 text-muted tabular-nums">
                                    {livre.prix ? `${livre.prix} €` : '—'}
                                </td>
                                <td className="py-3 pr-4 text-muted tabular-nums hidden lg:table-cell">
                                    {livre.noteMoyenne ?? '—'}
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
