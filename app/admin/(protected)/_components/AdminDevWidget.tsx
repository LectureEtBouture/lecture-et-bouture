'use client';

import { useState } from 'react';
import { envoyerFeedbackDev } from '@/lib/actions/dev-feedback';

type FeedbackType = 'Bug' | 'Feedback' | 'Idée';
type Status = 'idle' | 'loading' | 'success' | 'error';

const TYPES: FeedbackType[] = ['Bug', 'Feedback', 'Idée'];

export function AdminDevWidget() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<FeedbackType>('Bug');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [toast, setToast] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');

        const formData = new FormData();
        formData.set('type', type);
        formData.set('message', message);

        try {
            await envoyerFeedbackDev(formData);
            setStatus('success');
            setToast(true);
            setTimeout(() => setToast(false), 3000);
            setTimeout(() => {
                setOpen(false);
                setStatus('idle');
                setMessage('');
                setType('Bug');
            }, 2000);
        } catch {
            setStatus('error');
        }
    }

    return (
        <>
            {toast && (
                <div className="fixed top-4 right-4 z-[60] bg-white border border-border px-4 py-3 shadow-sm text-sm text-foreground">
                    Message envoyé au développeur.
                </div>
            )}

            <div className="fixed bottom-6 right-6 z-50">
                {open && (
                    <div className="absolute bottom-12 right-0 w-[300px] bg-white border border-border shadow-sm">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <p className="font-serif text-sm font-bold text-foreground">
                                Signaler un problème
                            </p>
                            <button
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
                                    ✓ Message envoyé.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                                <div>
                                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium text-muted block mb-2">
                                        Type
                                    </span>
                                    <div className="flex gap-1.5">
                                        {TYPES.map((feedbackType) => (
                                            <button
                                                key={feedbackType}
                                                type="button"
                                                onClick={() =>
                                                    setType(feedbackType)
                                                }
                                                className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors ${
                                                    type === feedbackType
                                                        ? 'bg-primary text-background'
                                                        : 'border border-border text-muted hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                {feedbackType}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium text-muted block mb-2">
                                        Message
                                    </span>
                                    <textarea
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        required
                                        rows={4}
                                        className="w-full border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm rounded-sm focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                {status === 'error' && (
                                    <p className="text-[11px] text-danger">
                                        Erreur lors de l&rsquo;envoi.
                                        Réessayez.
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
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 px-3 py-2 bg-surface border border-border text-muted text-[11px] uppercase tracking-[0.1em] hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                    <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                    >
                        <circle
                            cx="6.5"
                            cy="6.5"
                            r="5.5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                        />
                        <path
                            d="M6.5 4.5V6.5M6.5 8.5H6.51"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                        />
                    </svg>
                    Signaler un problème
                </button>
            </div>
        </>
    );
}
