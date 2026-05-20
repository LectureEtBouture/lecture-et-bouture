import Link from 'next/link';
import {
    deleteEvenement,
    toggleEvenementPublie,
} from '@/lib/actions/evenements';

type Evenement = {
    id: string;
    titre: string;
    lieu: string | null;
    dateDebut: Date;
    dateFin: Date | null;
    publie: boolean;
};

type Etat = 'a-venir' | 'en-cours' | 'passe';

function getEtat(dateDebut: Date, dateFin: Date | null, now: Date): Etat {
    if (dateDebut > now) return 'a-venir';
    if (dateFin && dateFin > now) return 'en-cours';
    return 'passe';
}

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

function PublieToggle({ id, publie }: { id: string; publie: boolean }) {
    return (
        <form
            action={async () => {
                'use server';
                await toggleEvenementPublie(id);
            }}
            className="contents"
        >
            <button
                type="submit"
                className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border transition-colors leading-none ${publie ? 'border-primary text-primary hover:bg-primary hover:text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`}
            >
                {publie ? 'Publié' : 'Privé'}
            </button>
        </form>
    );
}

export function EvenementRowMobile({
    evenement,
    now,
}: {
    evenement: Evenement;
    now: Date;
}) {
    const etat = getEtat(evenement.dateDebut, evenement.dateFin, now);

    return (
        <div className="py-3 space-y-2">
            <div>
                <p
                    className={`text-sm font-medium leading-snug ${etat === 'passe' ? 'text-muted' : 'text-foreground'}`}
                >
                    {evenement.titre}
                </p>
                <p className="text-xs text-muted mt-0.5">
                    {formatDateShort(evenement.dateDebut)}
                </p>
                {evenement.lieu && (
                    <p className="text-xs text-muted/70">{evenement.lieu}</p>
                )}
            </div>
            <div className="flex items-center justify-between">
                <PublieToggle id={evenement.id} publie={evenement.publie} />
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/evenements/${evenement.id}/modifier`}
                        className="text-xs text-muted hover:text-primary transition-colors"
                    >
                        Modifier
                    </Link>
                    <form
                        action={async () => {
                            'use server';
                            await deleteEvenement(evenement.id);
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
        </div>
    );
}

export function EvenementRowDesktop({
    evenement,
    now,
}: {
    evenement: Evenement;
    now: Date;
}) {
    const etat = getEtat(evenement.dateDebut, evenement.dateFin, now);

    return (
        <tr className="border-b border-border/50 hover:bg-white transition-colors px-4">
            <td className="py-3 pr-4">
                <p
                    className={`font-medium leading-snug ${etat === 'passe' ? 'text-muted' : 'text-foreground'}`}
                >
                    {evenement.titre}
                </p>
                {etat === 'passe' && (
                    <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                        Passé
                    </span>
                )}
                {etat === 'en-cours' && (
                    <span className="text-[10px] uppercase tracking-[0.08em] text-primary">
                        En cours
                    </span>
                )}
            </td>
            <td className="py-3 pr-4 text-muted text-xs">
                {formatDate(evenement.dateDebut)}
            </td>
            <td className="py-3 pr-4 text-muted hidden md:table-cell">
                {evenement.lieu ?? '—'}
            </td>
            <td className="py-3 pr-4">
                <PublieToggle id={evenement.id} publie={evenement.publie} />
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
                            await deleteEvenement(evenement.id);
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
}
