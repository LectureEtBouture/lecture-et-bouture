'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="min-h-[70vh] flex items-center justify-center px-6">
            <div className="max-w-md w-full space-y-10 text-center">
                <p className="font-serif text-[clamp(6rem,18vw,10rem)] font-bold text-primary/10 leading-none select-none tabular-nums">
                    500
                </p>
                <div className="space-y-4 -mt-6">
                    <h1 className="font-serif text-[clamp(1.5rem,4vw,2rem)] font-bold text-foreground leading-snug">
                        Quelque chose a mal tourné
                    </h1>
                    <p className="text-sm text-muted leading-relaxed max-w-[42ch] mx-auto">
                        Une erreur inattendue s&apos;est produite. Vous pouvez
                        réessayer, ou revenir à l&apos;accueil.
                    </p>
                    {error.digest && (
                        <p className="text-[10px] font-mono text-muted/60">
                            erreur {error.digest}
                        </p>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                        onClick={reset}
                        className="px-8 py-3 bg-primary text-background text-[11px] uppercase tracking-[0.12em] hover:bg-primary-light transition-colors"
                    >
                        Réessayer
                    </button>
                    <Link
                        href="/"
                        className="px-8 py-3 border border-border text-[11px] uppercase tracking-[0.12em] text-muted hover:text-foreground transition-colors"
                    >
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </main>
    );
}
