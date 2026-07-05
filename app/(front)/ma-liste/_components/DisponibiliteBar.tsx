'use client';

import { useEffect, useState } from 'react';
import type { WishlistItem } from '@/hooks/useWishlist';
import { NUDGE_CLIENT_ID } from '@/lib/nudge-client-id';
import { AltchaWidget } from '@/components/ui/AltchaWidget';

type FormState = 'idle' | 'sending' | 'error';
type Toast = { variant: 'success' | 'error'; message: string };

function DisponibiliteToast({
    toast,
    onClose,
}: {
    toast: Toast | null;
    onClose: () => void;
}) {
    useEffect(() => {
        if (!toast) return;
        const delay = toast.variant === 'success' ? 4000 : 6000;
        const timer = setTimeout(onClose, delay);
        return () => clearTimeout(timer);
    }, [toast, onClose]);

    if (!toast) return null;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={[
                'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface',
                toast.variant === 'error'
                    ? 'border border-danger'
                    : 'border border-border',
                'shadow-[0_2px_12px_rgba(26,26,26,0.06)]',
                'max-w-md w-[calc(100%-3rem)] px-5 py-4 flex items-center justify-between gap-4',
                'transition-[opacity,transform] motion-reduce:transition-none duration-300 ease-out',
            ].join(' ')}
        >
            <p
                className={`text-sm ${toast.variant === 'error' ? 'text-danger' : 'text-foreground'}`}
            >
                {toast.message}
            </p>
            <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="text-muted hover:text-foreground transition-colors p-1 shrink-0"
            >
                <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <path d="M1 1l8 8M9 1L1 9" />
                </svg>
            </button>
        </div>
    );
}

export function DisponibiliteBar({
    selected,
    onClear,
}: {
    selected: WishlistItem[];
    onClear: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [formState, setFormState] = useState<FormState>('idle');
    const [toast, setToast] = useState<Toast | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const data = new FormData(form);
        setFormState('sending');

        try {
            const res = await fetch('/api/disponibilite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nom: data.get('nom'),
                    prenom: data.get('prenom'),
                    email: data.get('email'),
                    telephone: data.get('telephone') || null,
                    website: data.get('website'),
                    altcha: data.get('altcha'),
                    cid: NUDGE_CLIENT_ID,
                    livres: selected.map((l) => ({
                        inventaireUri: l.slug,
                        titre: l.titre,
                        auteur: l.auteur ?? null,
                        slug: l.slug,
                    })),
                }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error((err as { error?: string }).error ?? 'Erreur');
            }

            setFormState('idle');
            setExpanded(false);
            setToast({
                variant: 'success',
                message:
                    'Demande envoyée. La librairie vous contactera rapidement.',
            });
            onClear();
        } catch (err) {
            setFormState('error');
            setToast({
                variant: 'error',
                message:
                    err instanceof Error ? err.message : 'Erreur inattendue.',
            });
        }
    }

    const toastEl = (
        <DisponibiliteToast toast={toast} onClose={() => setToast(null)} />
    );

    if (selected.length === 0) return toastEl;

    const count = selected.length;
    const countLabel = `${count} livre${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`;

    return (
        <>
            {toastEl}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary text-background shadow-[0_-4px_24px_rgba(0,0,0,0.18)]">
                {!expanded ? (
                    <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
                        <span className="text-sm font-medium flex-1 min-w-0 truncate">
                            {countLabel}
                        </span>
                        <button
                            type="button"
                            onClick={onClear}
                            className="text-[11px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100 transition-opacity shrink-0"
                        >
                            Effacer
                        </button>
                        <button
                            type="button"
                            onClick={() => setExpanded(true)}
                            className="px-5 py-2.5 bg-background text-primary text-[11px] uppercase tracking-[0.1em] hover:bg-background/90 transition-colors shrink-0"
                        >
                            Demander la disponibilité →
                        </button>
                    </div>
                ) : (
                    <div className="max-w-6xl mx-auto px-6 py-6 space-y-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2 min-w-0">
                                <p className="text-[11px] uppercase tracking-[0.1em] opacity-60">
                                    {countLabel}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {selected.map((livre) => (
                                        <span
                                            key={livre.slug}
                                            className="text-xs border border-background/20 px-2 py-1 max-w-[200px] truncate"
                                        >
                                            {livre.titre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setExpanded(false)}
                                className="text-[11px] uppercase tracking-[0.1em] opacity-60 hover:opacity-100 transition-opacity shrink-0 pt-1"
                            >
                                ↓ Réduire
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <input
                                type="text"
                                name="website"
                                className="sr-only"
                                tabIndex={-1}
                                autoComplete="off"
                                aria-hidden="true"
                            />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <input
                                    type="text"
                                    name="nom"
                                    placeholder="Nom"
                                    required
                                    maxLength={100}
                                    className="bg-background/10 border border-background/20 text-background placeholder:text-background/50 px-3 py-2.5 text-sm focus:outline-none focus:border-background/60 transition-colors"
                                />
                                <input
                                    type="text"
                                    name="prenom"
                                    placeholder="Prénom"
                                    required
                                    maxLength={100}
                                    className="bg-background/10 border border-background/20 text-background placeholder:text-background/50 px-3 py-2.5 text-sm focus:outline-none focus:border-background/60 transition-colors"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    required
                                    maxLength={200}
                                    className="bg-background/10 border border-background/20 text-background placeholder:text-background/50 px-3 py-2.5 text-sm focus:outline-none focus:border-background/60 transition-colors"
                                />
                                <div className="flex gap-3">
                                    <input
                                        type="tel"
                                        name="telephone"
                                        placeholder="Téléphone (optionnel)"
                                        maxLength={20}
                                        className="flex-1 min-w-0 bg-background/10 border border-background/20 text-background placeholder:text-background/50 px-3 py-2.5 text-sm focus:outline-none focus:border-background/60 transition-colors"
                                    />
                                    <button
                                        type="submit"
                                        disabled={formState === 'sending'}
                                        className="px-5 py-2.5 bg-background text-primary text-[11px] uppercase tracking-[0.1em] hover:bg-background/90 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
                                    >
                                        {formState === 'sending'
                                            ? 'Envoi…'
                                            : 'Envoyer'}
                                    </button>
                                </div>
                            </div>
                            <AltchaWidget />
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}
