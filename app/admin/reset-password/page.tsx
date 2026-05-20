'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/lib/actions/users';
import { siteConfig } from '@/lib/metadata';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token') ?? '';

    const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');

        const form = e.currentTarget;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        const confirm = (form.elements.namedItem('confirm') as HTMLInputElement).value;

        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setState('loading');
        const data = new FormData();
        data.set('token', token);
        data.set('password', password);

        const result = await resetPassword(data);
        if (result?.error) {
            setError(result.error);
            setState('idle');
        } else {
            setState('done');
            setTimeout(() => router.push('/admin/login'), 2000);
        }
    }

    if (!token) {
        return (
            <div className="space-y-4">
                <p className="text-sm text-red-600">Lien invalide ou manquant.</p>
                <Link
                    href="/admin/forgot-password"
                    className="text-sm text-primary hover:underline"
                >
                    Faire une nouvelle demande
                </Link>
            </div>
        );
    }

    if (state === 'done') {
        return (
            <p className="text-sm text-foreground">
                Mot de passe mis à jour. Redirection vers la connexion...
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
                <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                >
                    Nouveau mot de passe
                </label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4B3E]"
                />
                <p className="text-xs text-neutral-400">8 caractères minimum</p>
            </div>

            <div className="space-y-1">
                <label
                    htmlFor="confirm"
                    className="text-sm font-medium text-foreground"
                >
                    Confirmer
                </label>
                <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4B3E]"
                />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
                type="submit"
                disabled={state === 'loading'}
                className="w-full py-2 bg-[#2D4B3E] text-white text-sm font-medium rounded-lg hover:bg-[#243d32] disabled:opacity-50 transition-colors"
            >
                {state === 'loading' ? 'Enregistrement...' : 'Enregistrer'}
            </button>
        </form>
    );
}

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F5F4EF]">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-foreground">
                        Nouveau mot de passe
                    </h1>
                    <p className="text-sm text-neutral-500">{siteConfig.name}</p>
                </div>
                <Suspense fallback={null}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </main>
    );
}
