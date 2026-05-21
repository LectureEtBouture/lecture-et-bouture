import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { createUser } from '@/lib/actions/users';

const ALL_ROLES = [
    { value: 'super_admin', label: 'Super Admin' },
    { value: 'admin', label: 'Admin' },
    { value: 'contributor', label: 'Contributeur' },
    { value: 'moderator', label: 'Modérateur' },
    { value: 'editor', label: 'Éditeur' },
] as const;

const ADMIN_ROLES = ALL_ROLES.filter(
    (role) =>
        role.value === 'editor' ||
        role.value === 'moderator' ||
        role.value === 'contributor',
);

export default async function NouvelUtilisateurPage() {
    const session = await auth();
    const role = session?.user?.role;
    if (role !== 'super_admin' && role !== 'admin') notFound();

    const roles = role === 'super_admin' ? ALL_ROLES : ADMIN_ROLES;

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouvel utilisateur
            </h1>
            <form action={createUser} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Email
                    </label>
                    <input
                        name="email"
                        type="email"
                        required
                        autoComplete="off"
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Mot de passe
                    </label>
                    <input
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                    <p className="text-[11px] text-muted">
                        8 caractères minimum
                    </p>
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Rôle
                    </label>
                    <select
                        name="role"
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    >
                        {roles.map((role) => (
                            <option key={role.value} value={role.value}>
                                {role.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Créer
                    </button>
                    <a
                        href="/admin/users"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
