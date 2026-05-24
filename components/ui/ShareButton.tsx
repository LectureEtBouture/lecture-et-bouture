'use client';

import { useState } from 'react';

export function ShareButton({ titre }: { titre: string }) {
    const [state, setState] = useState<'idle' | 'copied'>('idle');

    async function handleShare() {
        const url = window.location.href;

        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({ title: titre, url });
            } catch {
                // Dismissed by user — no feedback needed
            }
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            setState('copied');
            setTimeout(() => setState('idle'), 2000);
        } catch {
            // Clipboard blocked — silent fail
        }
    }

    const copied = state === 'copied';

    return (
        <button
            type="button"
            onClick={handleShare}
            aria-label={copied ? 'Lien copié' : 'Copier le lien de cette page'}
            className={`flex items-center gap-2 text-xs uppercase tracking-[0.1em] border px-4 py-2.5 transition-colors duration-150 ${
                copied
                    ? 'border-primary text-primary'
                    : 'border-border text-muted hover:border-primary hover:text-primary'
            }`}
        >
            {copied ? <CheckIcon /> : <LinkIcon />}
            {copied ? 'Lien copié' : 'Partager'}
        </button>
    );
}

function LinkIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M5 7.5C5.46 8.08 6.17 8.45 6.95 8.45C7.5 8.45 8.02 8.25 8.42 7.9L10.42 5.9C11.18 5.14 11.18 3.91 10.42 3.15C9.66 2.39 8.43 2.39 7.67 3.15L6.68 4.14"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
            <path
                d="M8 5.5C7.54 4.92 6.83 4.55 6.05 4.55C5.5 4.55 4.98 4.75 4.58 5.1L2.58 7.1C1.82 7.86 1.82 9.09 2.58 9.85C3.34 10.61 4.57 10.61 5.33 9.85L6.32 8.86"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 13 13"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M2.5 6.5L5.5 9.5L10.5 4"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
