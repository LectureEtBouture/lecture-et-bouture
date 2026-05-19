import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page introuvable',
};

export default function NotFound() {
    return (
        <main className="min-h-[70vh] flex items-center justify-center px-6">
            <div className="max-w-md w-full space-y-10 text-center">
                <p className="font-serif text-[clamp(6rem,18vw,10rem)] font-bold text-primary/10 leading-none select-none tabular-nums">
                    404
                </p>
                <div className="space-y-4 -mt-6">
                    <h1 className="font-serif text-[clamp(1.5rem,4vw,2rem)] font-bold text-foreground leading-snug">
                        Cette page s&apos;est égarée
                    </h1>
                    <p className="text-sm text-muted leading-relaxed max-w-[42ch] mx-auto">
                        Elle a peut-être été déplacée, renommée, ou n&apos;a
                        jamais existé. Les bonnes choses se trouvent parfois
                        ailleurs.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-primary text-background text-[11px] uppercase tracking-[0.12em] hover:bg-primary-light transition-colors"
                    >
                        Retour à l&apos;accueil
                    </Link>
                    <Link
                        href="/livres"
                        className="px-8 py-3 border border-border text-[11px] uppercase tracking-[0.12em] text-muted hover:text-foreground transition-colors"
                    >
                        Parcourir les livres
                    </Link>
                </div>
            </div>
        </main>
    );
}
