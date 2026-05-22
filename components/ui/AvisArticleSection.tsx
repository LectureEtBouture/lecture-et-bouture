'use client';

import { useState } from 'react';
import type { AvisItem } from '@/lib/db/avis';

function AvisArticleForm({ itemId }: { itemId: string }) {
    const [auteurNom, setAuteurNom] = useState('');
    const [texte, setTexte] = useState('');
    const [status, setStatus] = useState<
        'idle' | 'submitting' | 'success' | 'error'
    >('idle');

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setStatus('submitting');
        try {
            const res = await fetch('/api/avis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    itemId,
                    type: 'article',
                    auteurNom,
                    texte,
                }),
            });
            setStatus(res.ok ? 'success' : 'error');
        } catch {
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <p className="text-sm text-primary">
                Merci pour votre commentaire — il sera publié après modération.
            </p>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-muted">
                Laisser un commentaire
            </h3>
            <input
                type="text"
                placeholder="Votre nom"
                value={auteurNom}
                onChange={(event) => setAuteurNom(event.target.value)}
                required
                minLength={2}
                maxLength={100}
                className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <textarea
                placeholder="Votre commentaire (optionnel)"
                value={texte}
                onChange={(event) => setTexte(event.target.value)}
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-border bg-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
            {status === 'error' && (
                <p className="text-xs text-red-600">
                    Une erreur est survenue, veuillez réessayer.
                </p>
            )}
            <button
                type="submit"
                disabled={status === 'submitting'}
                className="px-5 py-2.5 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors disabled:opacity-50"
            >
                {status === 'submitting' ? 'Envoi…' : 'Envoyer'}
            </button>
        </form>
    );
}

export function AvisArticleSection({
    avis,
    articleId,
}: {
    avis: AvisItem[];
    articleId: string;
}) {
    return (
        <div className="space-y-8 border-t border-border pt-10">
            {avis.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xs uppercase tracking-widest text-muted">
                        Commentaires ({avis.length})
                    </h2>
                    <div className="space-y-6">
                        {avis.map((avisItem) => (
                            <div key={avisItem.id} className="space-y-1">
                                <span className="text-sm font-medium text-foreground">
                                    {avisItem.auteurNom}
                                </span>
                                {avisItem.texte && (
                                    <p className="text-sm text-foreground/80 leading-relaxed max-w-[60ch]">
                                        {avisItem.texte}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <AvisArticleForm itemId={articleId} />
        </div>
    );
}
