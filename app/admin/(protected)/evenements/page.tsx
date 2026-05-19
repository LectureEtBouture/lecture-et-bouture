import Link from 'next/link';
import { getEvenements, deleteEvenement } from '@/lib/actions/evenements';

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatDateShort(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default async function AdminEvenementsPage() {
    const data = await getEvenements();
    const now = new Date();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Événements
                    </h1>
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

            {data.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucun événement planifié.
                </p>
            ) : (
                <>
                    {/* Mobile cards */}
                    <div className="sm:hidden divide-y divide-border/50">
                        {data.map((evenement) => {
                            const past = new Date(evenement.dateDebut) < now;
                            return (
                                <div
                                    key={evenement.id}
                                    className="py-3 space-y-2"
                                >
                                    <div>
                                        <p
                                            className={`text-sm font-medium leading-snug ${past ? 'text-muted' : 'text-foreground'}`}
                                        >
                                            {evenement.titre}
                                        </p>
                                        <p className="text-xs text-muted mt-0.5">
                                            {formatDateShort(
                                                evenement.dateDebut,
                                            )}
                                        </p>
                                        {evenement.lieu && (
                                            <p className="text-xs text-muted/70">
                                                {evenement.lieu}
                                            </p>
                                        )}
                                        {past && (
                                            <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                                                Passé
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-end gap-4">
                                        <Link
                                            href={`/admin/evenements/${evenement.id}/modifier`}
                                            className="text-xs text-muted hover:text-primary transition-colors"
                                        >
                                            Modifier
                                        </Link>
                                        <form
                                            action={async () => {
                                                'use server';
                                                await deleteEvenement(
                                                    evenement.id,
                                                );
                                            }}
                                            className="contents"
                                        >
                                            <button
                                                type="submit"
                                                className="text-xs text-muted hover:text-red-600 transition-colors"
                                            >
                                                Supprimer
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop table */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-[40%]">
                                        Titre
                                    </th>
                                    <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                        Date
                                    </th>
                                    <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden md:table-cell">
                                        Lieu
                                    </th>
                                    <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((evenement) => {
                                    const past =
                                        new Date(evenement.dateDebut) < now;
                                    return (
                                        <tr
                                            key={evenement.id}
                                            className="border-b border-border/50 hover:bg-white transition-colors"
                                        >
                                            <td className="py-3 pr-4">
                                                <p
                                                    className={`font-medium leading-snug ${past ? 'text-muted' : 'text-foreground'}`}
                                                >
                                                    {evenement.titre}
                                                </p>
                                                {past && (
                                                    <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                                                        Passé
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-muted text-xs">
                                                {formatDate(
                                                    evenement.dateDebut,
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 text-muted hidden md:table-cell">
                                                {evenement.lieu ?? '—'}
                                            </td>
                                            <td className="py-3 pl-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-4">
                                                    <Link
                                                        href={`/admin/evenements/${evenement.id}/modifier`}
                                                        className="text-xs text-muted hover:text-primary transition-colors"
                                                    >
                                                        Modifier
                                                    </Link>
                                                    <form
                                                        action={async () => {
                                                            'use server';
                                                            await deleteEvenement(
                                                                evenement.id,
                                                            );
                                                        }}
                                                        className="contents"
                                                    >
                                                        <button
                                                            type="submit"
                                                            className="text-xs text-muted hover:text-red-600 transition-colors"
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
