'use client';

import { trackFormbricksEvent } from '@/lib/formbricks-sdk';

export function FeedbackButton({ actionKey }: { actionKey: string }) {
    async function handleClick() {
        await trackFormbricksEvent(actionKey);
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-background text-xs uppercase tracking-[0.1em] px-4 py-2.5 shadow-md hover:opacity-90 transition-opacity"
            aria-label="Donner mon avis"
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
            Feedback
        </button>
    );
}
