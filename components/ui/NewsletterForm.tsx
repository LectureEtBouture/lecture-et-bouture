'use client';

import { useState, type FormEvent } from 'react';
import { subscribeToNewsletter } from '@/lib/actions/newsletter';

export function NewsletterForm() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setStatus('loading');
        const result = await subscribeToNewsletter(email);
        if (result.ok) {
            setStatus('success');
        } else {
            setErrorMsg(result.error ?? 'Une erreur est survenue.');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <p className="text-sm text-foreground">
                Adresse enregistrée.{' '}
                <span className="text-muted">À bientôt.</span>
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                    <label htmlFor="newsletter-email" className="sr-only">
                        Adresse e-mail
                    </label>
                    <input
                        id="newsletter-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(evt) => setEmail(evt.target.value)}
                        placeholder="votre adresse e-mail"
                        required
                        disabled={status === 'loading'}
                        aria-describedby={
                            status === 'error' ? 'newsletter-error' : undefined
                        }
                        aria-invalid={status === 'error'}
                        className="w-full text-sm px-3 py-2.5 bg-surface border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted/60 disabled:opacity-50"
                    />
                    {status === 'error' && (
                        <p
                            id="newsletter-error"
                            role="alert"
                            className="mt-1.5 text-xs text-danger"
                        >
                            {errorMsg}
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={status === 'loading' || !email.trim()}
                    className="shrink-0 bg-primary text-background text-xs uppercase tracking-[0.1em] px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {status === 'loading' ? '…' : "S'inscrire"}
                </button>
            </div>
        </form>
    );
}
