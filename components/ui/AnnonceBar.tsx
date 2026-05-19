'use client';

import { useState, useSyncExternalStore } from 'react';
import type { Annonce } from '@/lib/types/parametres';

const noop = () => () => {};

export function AnnonceBar({ annonce }: { annonce: Annonce }) {
    const fingerprint = `${annonce.message}|${annonce.expire_at ?? ''}`;

    const dismissed = useSyncExternalStore(
        noop,
        () => localStorage.getItem('leb_annonce_dismissed') === fingerprint,
        () => false,
    );

    const [gone, setGone] = useState(false);

    if (gone || dismissed) return null;

    function dismiss() {
        localStorage.setItem('leb_annonce_dismissed', fingerprint);
        setGone(true);
    }

    const isWarning = annonce.type === 'warning';

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`relative flex items-center justify-center px-12 py-2.5 text-sm ${
                isWarning
                    ? 'bg-[oklch(97%_0.03_85)] text-[oklch(40%_0.12_60)] border-b border-[oklch(88%_0.08_80)]'
                    : 'bg-[oklch(96%_0.018_160)] text-foreground border-b border-[oklch(88%_0.025_160)]'
            }`}
        >
            <p className="max-w-2xl text-center leading-relaxed text-[13px]">
                {annonce.message}
            </p>
            <button
                type="button"
                onClick={dismiss}
                aria-label="Fermer l'annonce"
                className="absolute right-0 top-0 h-full px-4 flex items-center justify-center opacity-40 hover:opacity-80 transition-opacity"
            >
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                >
                    <path d="M1 1l10 10M11 1L1 11" />
                </svg>
            </button>
        </div>
    );
}
