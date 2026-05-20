'use client';

import { useState } from 'react';

type Props = {
    itemId: string;
    type: 'livre' | 'bouture';
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

function StarPicker({
    value,
    onChange,
}: {
    value: number;
    onChange: (n: number) => void;
}) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    return (
        <div className="flex gap-0.5" role="group" aria-label="Note sur 5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    aria-label={`${star} étoile${star > 1 ? 's' : ''}`}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(star)}
                    className={`text-2xl leading-none transition-colors select-none ${
                        star <= active ? 'text-primary' : 'text-border'
                    }`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

export function AvisForm({ itemId, type }: Props) {
    const [note, setNote] = useState(0);
    const [auteurNom, setAuteurNom] = useState('');
    const [texte, setTexte] = useState('');
    const [status, setStatus] = useState<Status>('idle');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (note === 0) return;
        setStatus('submitting');
        try {
            const res = await fetch('/api/avis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, type, note, auteurNom, texte }),
            });
            setStatus(res.ok ? 'success' : 'error');
        } catch {
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div className="border border-border bg-surface px-6 py-4">
                <p className="text-sm text-foreground">
                    Merci — votre avis sera visible sous peu.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <h2 className="text-xs uppercase tracking-widest text-muted">
                Laisser un avis
            </h2>

            <label className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                    Note
                </span>
                <StarPicker value={note} onChange={setNote} />
            </label>

            <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                    Prénom
                </span>
                <input
                    type="text"
                    value={auteurNom}
                    onChange={(e) => setAuteurNom(e.target.value)}
                    maxLength={50}
                    required
                    className="max-w-xs border border-border bg-surface text-foreground px-[14px] py-[10px] text-base rounded-sm focus:outline-none focus:border-primary"
                />
            </label>

            <label className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                    Avis{' '}
                    <span className="normal-case tracking-normal font-normal text-muted">
                        (facultatif)
                    </span>
                </span>
                <textarea
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    maxLength={500}
                    rows={3}
                    className="max-w-lg border border-border bg-surface text-foreground px-[14px] py-[10px] text-base rounded-sm focus:outline-none focus:border-primary resize-none"
                />
            </label>

            {status === 'error' && (
                <div className="border border-[#b94a48] bg-surface px-6 py-4">
                    <p className="text-sm text-foreground">
                        Une erreur est survenue, réessayez.
                    </p>
                </div>
            )}

            <div>
                <button
                    type="submit"
                    disabled={status === 'submitting' || note === 0}
                    className="bg-primary text-background px-6 py-[10px] text-[11px] uppercase tracking-widest font-medium hover:bg-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {status === 'submitting' ? 'Envoi…' : 'Envoyer'}
                </button>
            </div>
        </form>
    );
}
