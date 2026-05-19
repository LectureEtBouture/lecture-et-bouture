import Link from 'next/link';
import { Stars } from '@/components/ui/Stars';

type Livre = {
    titre: string;
    auteur: string;
    serie?: string | null;
    numeroSerie?: number | null;
    choixLibrairie?: boolean;
    noteMoyenne?: string | null;
};

export function LivreHeader({ livre }: { livre: Livre }) {
    const noteMoyenne = livre.noteMoyenne
        ? parseFloat(livre.noteMoyenne)
        : null;

    return (
        <div className="space-y-2">
            {livre.serie && (
                <p className="text-xs uppercase tracking-widest text-muted">
                    {livre.serie} · Tome {livre.numeroSerie}
                </p>
            )}
            <h1 className="font-serif text-4xl font-bold text-foreground leading-tight tracking-tight">
                {livre.titre}
            </h1>
            <Link
                href={`/livres?q=${encodeURIComponent(livre.auteur)}`}
                className="text-lg text-muted hover:text-primary transition-colors"
            >
                {livre.auteur}
            </Link>
            {noteMoyenne && (
                <div className="flex items-center gap-2 pt-1">
                    <Stars note={noteMoyenne} />
                    <span className="text-xs text-muted">
                        {noteMoyenne.toFixed(1)} / 5
                    </span>
                </div>
            )}
            {livre.choixLibrairie && (
                <span className="inline-block bg-background border border-border px-2 py-1 text-[7px] font-medium uppercase tracking-[0.12em] text-primary leading-tight mt-1">
                    Choix de la librairie
                </span>
            )}
        </div>
    );
}
