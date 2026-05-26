'use client';

import Link from 'next/link';
import type { NudgeTitre } from '@/hooks/useNudge';

const MAX_SHOWN = 2;

export function NudgeToast({
    titres,
    visible,
    onClose,
}: {
    titres: NudgeTitre[];
    visible: boolean;
    onClose: () => void;
}) {
    if (titres.length === 0) return null;

    const shown = titres.slice(0, MAX_SHOWN);
    const overflow = titres.length - MAX_SHOWN;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={[
                'fixed bottom-6 left-6 z-50 bg-surface border border-border',
                'shadow-[0_2px_12px_rgba(26,26,26,0.06)]',
                'max-w-[280px] p-4 transition-[opacity,transform] motion-reduce:transition-none',
                visible
                    ? 'opacity-100 translate-y-0 duration-300 ease-out'
                    : 'opacity-0 translate-y-4 duration-200 ease-in pointer-events-none',
            ].join(' ')}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="absolute top-2.5 right-2.5 text-muted hover:text-foreground transition-colors"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" />
                </svg>
            </button>

            <p className="text-[11px] uppercase tracking-[0.1em] text-muted leading-snug mb-2.5 pr-4">
                En ce moment, un lecteur s&apos;intéresse à
            </p>

            <ul className="space-y-1">
                {shown.map((livre) => (
                    <li key={livre.slug}>
                        <Link
                            href={`/livres/${livre.slug}`}
                            className="font-serif italic text-sm text-primary hover:underline underline-offset-2 line-clamp-1 block"
                        >
                            {livre.titre}
                        </Link>
                    </li>
                ))}
                {overflow > 0 && (
                    <li className="text-[11px] text-muted pt-0.5">
                        et {overflow} autre{overflow > 1 ? 's' : ''}
                    </li>
                )}
            </ul>
        </div>
    );
}
