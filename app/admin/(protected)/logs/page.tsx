import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getAdminLogs } from '@/lib/queries/admin-logs';

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const ACTION_LABELS: Record<string, string> = {
    'livre.create': 'Créer',
    'livre.update': 'Modifier',
    'livre.delete': 'Supprimer',
    'bouture.create': 'Créer',
    'bouture.update': 'Modifier',
    'bouture.delete': 'Supprimer',
    'genre.create': 'Créer',
    'genre.update': 'Modifier',
    'genre.delete': 'Supprimer',
    'rayon.create': 'Créer',
    'rayon.update': 'Modifier',
    'rayon.delete': 'Supprimer',
    'evenement.create': 'Créer',
    'evenement.update': 'Modifier',
    'evenement.delete': 'Supprimer',
    'evenement.publier': 'Publier',
    'evenement.depublier': 'Dépublier',
    'selection.create': 'Créer',
    'selection.update': 'Modifier',
    'selection.delete': 'Supprimer',
    'avis.valider': 'Valider',
    'avis.masquer': 'Masquer',
    'avis.remettre_en_ligne': 'Remettre en ligne',
    'avis.supprimer': 'Supprimer',
};

const ENTITY_LABELS: Record<string, string> = {
    livre: 'Livre',
    bouture: 'Bouture',
    genre: 'Genre',
    rayon: 'Rayon',
    evenement: 'Événement',
    selection: 'Sélection',
    avis: 'Avis',
};

const DELETE_ACTIONS = new Set([
    'livre.delete',
    'bouture.delete',
    'genre.delete',
    'rayon.delete',
    'evenement.delete',
    'selection.delete',
    'avis.supprimer',
]);

const CREATE_ACTIONS = new Set([
    'livre.create',
    'bouture.create',
    'genre.create',
    'rayon.create',
    'evenement.create',
    'selection.create',
]);

export default async function AdminLogsPage() {
    const session = await auth();
    if (session?.user?.role !== 'super_admin') notFound();

    const logs = await getAdminLogs();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Journaux
                </h1>
                <p className="text-[11px] text-muted mt-0.5">
                    {logs.length} entrée{logs.length !== 1 ? 's' : ''} — 200
                    dernières conservées
                </p>
            </div>

            {logs.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucune action enregistrée.
                </p>
            ) : (
                <>
                    {/* Desktop */}
                    <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-6 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-44">
                                        Date
                                    </th>
                                    <th className="text-left py-2 pr-6 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                        Utilisateur
                                    </th>
                                    <th className="text-left py-2 pr-6 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-28">
                                        Type
                                    </th>
                                    <th className="text-left py-2 pr-6 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-24">
                                        Action
                                    </th>
                                    <th className="text-left py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                        Entité
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="border-b border-border/40 hover:bg-white transition-colors"
                                    >
                                        <td className="py-2.5 pr-6 text-xs text-muted tabular-nums whitespace-nowrap">
                                            {formatDate(log.createdAt)}
                                        </td>
                                        <td className="py-2.5 pr-6 text-xs text-foreground truncate max-w-[180px]">
                                            {log.userEmail}
                                        </td>
                                        <td className="py-2.5 pr-6">
                                            <span className="text-[10px] uppercase tracking-[0.08em] text-muted">
                                                {log.entityType
                                                    ? (ENTITY_LABELS[
                                                          log.entityType
                                                      ] ?? log.entityType)
                                                    : '—'}
                                            </span>
                                        </td>
                                        <td className="py-2.5 pr-6">
                                            <span
                                                className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border leading-none ${
                                                    DELETE_ACTIONS.has(
                                                        log.action,
                                                    )
                                                        ? 'border-red-200 text-red-600'
                                                        : CREATE_ACTIONS.has(
                                                                log.action,
                                                            )
                                                          ? 'border-primary/30 text-primary'
                                                          : 'border-border text-muted'
                                                }`}
                                            >
                                                {ACTION_LABELS[log.action] ??
                                                    log.action}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-sm text-foreground">
                                            {log.entityLabel ?? (
                                                <span className="text-muted">
                                                    —
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile */}
                    <div className="sm:hidden divide-y divide-border/50">
                        {logs.map((log) => (
                            <div key={log.id} className="py-3 space-y-1">
                                <div className="flex items-center justify-between gap-4">
                                    <span
                                        className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border leading-none ${
                                            DELETE_ACTIONS.has(log.action)
                                                ? 'border-red-200 text-red-600'
                                                : CREATE_ACTIONS.has(log.action)
                                                  ? 'border-primary/30 text-primary'
                                                  : 'border-border text-muted'
                                        }`}
                                    >
                                        {ACTION_LABELS[log.action] ??
                                            log.action}
                                    </span>
                                    <span className="text-[11px] text-muted tabular-nums">
                                        {formatDate(log.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground">
                                    {log.entityLabel ?? '—'}
                                    {log.entityType && (
                                        <span className="text-muted ml-2 text-xs">
                                            {ENTITY_LABELS[log.entityType] ??
                                                log.entityType}
                                        </span>
                                    )}
                                </p>
                                <p className="text-xs text-muted">
                                    {log.userEmail}
                                </p>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
