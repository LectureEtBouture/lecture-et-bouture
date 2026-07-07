'use client';

import { useState } from 'react';
import { envoyerAvisVisiteur } from '@/lib/actions/visitor-feedback';
import { AltchaWidget } from '@/components/ui/AltchaWidget';

type Status = 'idle' | 'loading' | 'success' | 'error';

export function FeedbackWidget() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
        evt.preventDefault();
        setStatus('loading');
        setError(null);

        const formData = new FormData(evt.currentTarget);

        const result = await envoyerAvisVisiteur(formData);
        if (result.ok) {
            setStatus('success');
            setTimeout(() => {
                setOpen(false);
                setStatus('idle');
                setMessage('');
                setEmail('');
            }, 2000);
        } else {
            setStatus('error');
            setError(result.error);
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-40">
            {open && (
                <div
                    id="feedback-panel"
                    className="absolute bottom-14 right-0 w-[min(300px,calc(100vw-3rem))] bg-white border border-border shadow-md"
                >
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                        <p className="font-serif text-sm font-bold text-foreground">
                            Votre avis nous intéresse
                        </p>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="text-muted hover:text-foreground transition-colors p-1"
                            aria-label="Fermer"
                        >
                            <svg
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                            >
                                <path
                                    d="M1 1L11 11M11 1L1 11"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </button>
                    </div>

                    {status === 'success' ? (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-foreground">
                                ✓ Merci pour votre retour.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-4 space-y-3">
                            {/* Honeypot */}
                            <input
                                type="text"
                                name="website"
                                autoComplete="off"
                                tabIndex={-1}
                                aria-hidden="true"
                                style={{
                                    position: 'absolute',
                                    left: '-9999px',
                                    width: '1px',
                                    height: '1px',
                                    overflow: 'hidden',
                                    opacity: 0,
                                }}
                            />
                            <textarea
                                name="message"
                                value={message}
                                onChange={(evt) => setMessage(evt.target.value)}
                                required
                                rows={4}
                                placeholder="Une idée, une remarque…"
                                className="w-full border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm rounded-sm focus:outline-none focus:border-primary resize-none"
                            />
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(evt) => setEmail(evt.target.value)}
                                placeholder="Email (optionnel, pour vous répondre)"
                                className="w-full border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm rounded-sm focus:outline-none focus:border-primary"
                            />
                            <AltchaWidget />
                            {status === 'error' && (
                                <p className="text-[11px] text-danger">
                                    {error}
                                </p>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="bg-primary text-background px-6 py-2 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors hover:bg-primary-light disabled:opacity-50"
                                >
                                    {status === 'loading'
                                        ? 'Envoi…'
                                        : 'Envoyer →'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 bg-primary text-background text-xs uppercase tracking-[0.1em] px-3 sm:px-4 py-2.5 shadow-md hover:opacity-90 transition-opacity"
                aria-label={
                    open ? 'Fermer le formulaire d’avis' : 'Donner mon avis'
                }
                aria-expanded={open}
                aria-controls="feedback-panel"
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                >
                    <path
                        d="M1 1h12v9H8l-3 3V10H1V1Z"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="hidden sm:inline">
                    Votre avis nous intéresse
                </span>
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    aria-hidden="true"
                    className={`transition-transform duration-200 ease-out ${open ? 'rotate-180' : ''}`}
                >
                    <path
                        d="M1.5 3.5L5 7L8.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>
        </div>
    );
}
