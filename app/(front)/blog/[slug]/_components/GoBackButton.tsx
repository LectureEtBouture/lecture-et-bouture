'use client';

import { useRouter } from 'next/navigation';

export function GoBackButton() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            className="text-[11px] uppercase tracking-[0.1em] text-muted hover:text-primary transition-colors"
        >
            ← Retour
        </button>
    );
}
