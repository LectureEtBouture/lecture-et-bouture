'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '@/lib/actions/users';
import { siteConfig } from '@/lib/metadata';

export default function ForgotPasswordPage() {
    const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle');
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setState('loading');
        const form = new FormData(e.currentTarget);
        const result = await forgotPassword(form);
        if (result?.error) {
            setError(result.error);
            setState('idle');
        } else {
            setState('done');
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F5F4EF]">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8 space-y-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold text-foreground">
                        Mot de passe oublié
                    </h1>
                    <p className="text-sm text-neutral-500">{siteConfig.name}</p>
                </div>

                {state === 'done' ? (
                    <div className="space-y-4">
                        <p className="text-sm text-foreground">
                            Si un compte existe avec cet email, un lien de réinitialisation vous a été envoyé. Vérifiez votre boîte mail.
                        </p>
                        <Link
                            href="/admin/login"
                            className="text-sm text-primary hover:underline"
                        >
                            ← Retour à la connexion
                        </Link>
                    </div>
                ) : (
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
                                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D4B3E]"
                            />
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <button
                            type="submit"
                            disabled={state === 'loading'}
                            className="w-full py-2 bg-[#2D4B3E] text-white text-sm font-medium rounded-lg hover:bg-[#243d32] disabled:opacity-50 transition-colors"
                        >
                            {state === 'loading' ? 'Envoi...' : 'Envoyer le lien'}
                        </button>

                        <div className="text-center">
                            <Link
                                href="/admin/login"
                                className="text-sm text-neutral-500 hover:text-foreground transition-colors"
                            >
                                ← Retour à la connexion
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </main>
    );
}
