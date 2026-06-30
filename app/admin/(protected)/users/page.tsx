import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import {
    getUsers,
    deleteUser,
    initiatePasswordReset,
} from '@/lib/actions/users';

const ROLE_LABELS: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    editor: 'Éditeur',
    moderator: 'Modérateur',
    contributor: 'Contributeur',
};

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

export default async function AdminUsersPage() {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== 'super_admin' && role !== 'admin') notFound();

    const data = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Utilisateurs
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} compte{data.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/users/nouveau"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucun utilisateur.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-6 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Email
                                </th>
                                <th className="text-left py-2 pr-6 text-[11px] uppercase tracking-[0.1em] text-muted font-normal w-32">
                                    Rôle
                                </th>
                                <th className="text-left py-2 pr-6 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden sm:table-cell">
                                    Créé le
                                </th>
                                <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user) => (
                                <tr
                                    key={user.id}
                                    className="border-b border-border/50 hover:bg-white transition-colors"
                                >
                                    <td className="py-3 pr-6 max-w-[200px]">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className="text-foreground truncate">
                                                {user.email}
                                            </span>
                                            {user.id === session?.user?.id && (
                                                <span className="flex-none text-[10px] uppercase tracking-[0.08em] text-muted">
                                                    vous
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-3 pr-6">
                                        <span className="whitespace-nowrap text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border border-border text-muted leading-none">
                                            {ROLE_LABELS[user.role] ??
                                                user.role}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-6 text-xs text-muted hidden sm:table-cell">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-4">
                                            <Link
                                                href={`/admin/users/${user.id}/modifier`}
                                                className="text-xs text-muted hover:text-primary transition-colors"
                                            >
                                                Modifier
                                            </Link>
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    await initiatePasswordReset(
                                                        user.id,
                                                    );
                                                }}
                                                className="contents"
                                            >
                                                <button
                                                    type="submit"
                                                    className="text-xs text-muted hover:text-primary transition-colors"
                                                >
                                                    Reset mdp
                                                </button>
                                            </form>
                                            {user.id !== session?.user?.id && (
                                                <form
                                                    action={async () => {
                                                        'use server';
                                                        await deleteUser(
                                                            user.id,
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
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
