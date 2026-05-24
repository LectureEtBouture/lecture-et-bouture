'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { siteConfig } from '@/lib/metadata';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = new FormData(e.currentTarget);

        const result = await signIn('credentials', {
            email: form.get('email'),
            password: form.get('password'),
            redirect: false,
        });

        setLoading(false);

        if (result?.error) {
            setError('Email ou mot de passe incorrect.');
        } else {
            router.push('/admin');
        }
    }

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

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    {error && <p className="text-sm text-red-600">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-primary text-background text-sm font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>

                    <div className="text-center">
                        <a
                            href="/admin/forgot-password"
                            className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            Mot de passe oublié ?
                        </a>
                    </div>
                </form>
            </div>
        </main>
    );
}
