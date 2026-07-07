import Link from 'next/link';
import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getUser, updateUser } from '@/lib/actions/users';

const ALL_ROLES = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Éditeur' },
    { value: 'moderator', label: 'Modérateur' },
    { value: 'contributor', label: 'Contributeur' },
] as const;

const ADMIN_ROLES = ALL_ROLES.filter(
    (r) =>
        r.value === 'editor' ||
        r.value === 'moderator' ||
        r.value === 'contributor',
);

type Props = { params: Promise<{ id: string }> };

export default async function ModifierUtilisateurPage({ params }: Props) {
    const session = await auth();
    const actorRole = session?.user?.role;
    if (actorRole !== 'super_admin' && actorRole !== 'admin') notFound();

    const { id } = await params;
    const user = await getUser(id);
    if (!user) notFound();

    // Admin cannot manage super_admins
    if (actorRole === 'admin' && user.role === 'super_admin') notFound();

    const roles = actorRole === 'super_admin' ? ALL_ROLES : ADMIN_ROLES;
    const action = updateUser.bind(null, user.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier l&apos;utilisateur
            </h1>
            <form action={action} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        required
                        defaultValue={user.email}
                        autoComplete="off"
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Rôle
                    </label>
                    <select
                        name="role"
                        required
                        defaultValue={user.role}
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    >
                        {roles.map((r) => (
                            <option key={r.value} value={r.value}>
                                {r.label}
                            </option>
                        ))}
                    </select>
                </div>
                <p className="text-[11px] text-muted">
                    Pour changer le mot de passe, utilisez le bouton &quot;Reset
                    mdp&quot; sur la liste des utilisateurs.
                </p>
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Enregistrer
                    </button>
                    <Link
                        href="/admin/users"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    );
}
