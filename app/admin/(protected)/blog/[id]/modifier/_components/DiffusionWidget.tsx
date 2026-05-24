'use client';

import { useState, useTransition } from 'react';
import { diffuserArticle } from '@/lib/actions/diffusions';

type Diffusion = {
    sentAt: Date;
    recipientCount: number;
};

type Props = {
    articleId: string;
    articleTitre: string;
    subscriberCount: number;
    lastDiffusion: Diffusion | null;
};

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function DiffusionWidget({ articleId, articleTitre, subscriberCount, lastDiffusion }: Props) {
    const [state, setState] = useState<'idle' | 'confirming' | 'done'>('idle');
    const [result, setResult] = useState<{ count: number; sentAt: Date } | null>(
        lastDiffusion ? { count: lastDiffusion.recipientCount, sentAt: lastDiffusion.sentAt } : null,
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    function handleConfirm() {
        setError(null);
        startTransition(async () => {
            const res = await diffuserArticle(articleId);
            if (res.ok) {
                setResult({ count: res.count, sentAt: new Date() });
                setState('done');
            } else {
                setError(res.error);
                setState('idle');
            }
        });
    }

    const alreadySent = result !== null && state !== 'confirming';

    return (
        <div className="border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="font-serif text-base font-bold text-foreground">
                    Diffusion newsletter
                </h2>
                <span className="text-[11px] text-muted uppercase tracking-[0.08em]">
                    {subscriberCount} abonné{subscriberCount !== 1 ? 's' : ''}
                </span>
            </div>

            {alreadySent && (
                <p className="text-sm text-muted">
                    Envoyé à {result.count} abonné{result.count !== 1 ? 's' : ''} le{' '}
                    {formatDate(result.sentAt)}.
                </p>
            )}

            {error && (
                <p className="text-sm text-danger">{error}</p>
            )}

            {state === 'idle' && (
                <button
                    onClick={() => setState('confirming')}
                    disabled={subscriberCount === 0}
                    className="text-[11px] uppercase tracking-[0.1em] text-muted hover:text-primary border border-border hover:border-primary px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {alreadySent ? 'Renvoyer quand même' : 'Diffuser par email'}
                </button>
            )}

            {state === 'confirming' && (
                <div className="space-y-3">
                    <p className="text-sm text-foreground">
                        Envoyer{' '}
                        <span className="font-medium">«&nbsp;{articleTitre}&nbsp;»</span>{' '}
                        à {subscriberCount} abonné{subscriberCount !== 1 ? 's' : ''} ?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className="text-[11px] uppercase tracking-[0.1em] px-3 py-1.5 bg-primary text-background hover:bg-primary-light transition-colors disabled:opacity-60"
                        >
                            {isPending ? 'Envoi…' : 'Confirmer'}
                        </button>
                        <button
                            onClick={() => setState('idle')}
                            disabled={isPending}
                            className="text-[11px] uppercase tracking-[0.1em] px-3 py-1.5 border border-border text-muted hover:text-foreground transition-colors disabled:opacity-60"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}

            {state === 'done' && (
                <button
                    onClick={() => setState('confirming')}
                    className="text-[11px] uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors underline underline-offset-2"
                >
                    Renvoyer quand même
                </button>
            )}
        </div>
    );
}
