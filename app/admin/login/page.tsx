'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { login } from '@/lib/actions/auth';
import { siteConfig } from '@/lib/metadata';

export default function LoginPage() {
    const [state, action, pending] = useActionState(login, null);

    return (
        <main className="min-h-screen flex items-center justify-center bg-background">
            <div className="w-full max-w-sm bg-surface rounded-2xl shadow-sm p-8 space-y-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-foreground">
                        Back-office
                    </h1>
                    <p className="text-sm text-neutral-500">
                        {siteConfig.name}
                    </p>
                </div>

                <form action={action} method="post" className="space-y-4">
                    <div className="space-y-1">
                        <label
                            htmlFor="email"
                            className="text-sm font-medium text-foreground"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-1">
                        <label
                            htmlFor="password"
                            className="text-sm font-medium text-foreground"
                        >
                            Mot de passe
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoComplete="current-password"
                            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-sm text-red-600">{state.error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={pending}
                        className="w-full py-2 bg-primary text-background text-sm font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors"
                    >
                        {pending ? 'Connexion...' : 'Se connecter'}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/admin/forgot-password"
                            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                </form>
            </div>
        </main>
    );
}
