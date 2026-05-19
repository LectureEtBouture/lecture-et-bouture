import Link from 'next/link';

interface Alerte {
    label: string;
    count: number;
    href: string;
}

export function AlerteBar({ alertes }: { alertes: Alerte[] }) {
    return (
        <section>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted mb-3">
                À traiter
            </p>
            <div className="grid grid-cols-2 gap-3">
                {alertes.map((alerte) => {
                    const active = alerte.count > 0;
                    return (
                        <Link
                            key={alerte.href}
                            href={alerte.href}
                            className={`group relative block px-5 py-5 border transition-colors duration-150 ${
                                active
                                    ? 'bg-surface border-border hover:border-primary'
                                    : 'bg-background border-border/50 pointer-events-none'
                            }`}
                        >
                            {active && (
                                <span className="absolute inset-x-0 top-0 h-0.5 bg-primary" />
                            )}
                            <p
                                className={`font-serif text-5xl font-bold tabular-nums leading-none ${
                                    active
                                        ? 'text-foreground group-hover:text-primary transition-colors'
                                        : 'text-muted/50'
                                }`}
                            >
                                {alerte.count}
                            </p>
                            <p className="text-[11px] uppercase tracking-[0.1em] text-muted mt-3 leading-snug">
                                {alerte.label}
                            </p>
                            {active && (
                                <p className="text-[10px] uppercase tracking-[0.1em] text-primary mt-4 group-hover:text-primary-light transition-colors">
                                    Traiter →
                                </p>
                            )}
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
