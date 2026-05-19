import Image from 'next/image';
import Link from 'next/link';
import {
    getBoutureCoverColor,
    DIFFICULTE_LABELS,
    LUMIERE_LABELS,
} from '@/lib/data';
import type { BouturePublique } from '@/lib/queries/boutures';

// Pattern bento pour 5 items, répété par blocs de 5 au-delà
// span=2 → grande carte, span=1 → petite carte
// colStartClass: force col-start pour centrer le 5e item
const BENTO_PATTERN: { span: 1 | 2; colStartClass?: string }[] = [
    { span: 2 },
    { span: 1 },
    { span: 1 },
    { span: 2 },
    { span: 2, colStartClass: 'lg:col-start-2' },
];

function BentoCard({
    bouture,
    large,
}: {
    bouture: BouturePublique;
    large: boolean;
}) {
    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const coverImage = bouture.image ?? null;
    const difficulte = bouture.difficulte
        ? DIFFICULTE_LABELS[bouture.difficulte]
        : undefined;
    const lumiere = bouture.lumiere
        ? LUMIERE_LABELS[bouture.lumiere]
        : undefined;

    if (large) {
        return (
            <Link
                href={`/boutures/${bouture.slug}`}
                className="group flex flex-col lg:flex-row bg-surface h-full min-h-[240px] hover:shadow-[0_2px_12px_rgba(26,26,26,0.06)] transition-shadow duration-200"
            >
                <div
                    className="aspect-[4/3] lg:aspect-auto lg:w-[48%] flex-shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: coverColor }}
                >
                    {coverImage && (
                        <Image
                            src={coverImage}
                            alt={bouture.nom}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 30vw"
                        />
                    )}
                </div>
                <div className="flex flex-col justify-between p-6 flex-1">
                    <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            {lumiere}
                        </p>
                        <h3 className="font-serif text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                            {bouture.nom}
                        </h3>
                        <p className="text-sm text-muted italic">
                            {bouture.espece}
                        </p>
                    </div>
                    <div className="mt-6 space-y-3">
                        {bouture.description && (
                            <p className="text-sm text-foreground leading-[1.7] line-clamp-3 max-w-[40ch]">
                                {bouture.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted">
                                {difficulte}
                            </p>
                            <p className="text-sm font-medium text-primary">
                                {bouture.prix} €
                            </p>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link
            href={`/boutures/${bouture.slug}`}
            className="group block bg-surface hover:shadow-[0_2px_12px_rgba(26,26,26,0.06)] transition-shadow duration-200"
        >
            <div
                className="aspect-[3/4] w-full relative overflow-hidden"
                style={{ backgroundColor: coverColor }}
            >
                {coverImage && (
                    <Image
                        src={coverImage}
                        alt={bouture.nom}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                )}
            </div>
            <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-muted">
                    {lumiere}
                </p>
                <h3 className="font-serif text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {bouture.nom}
                </h3>
                <p className="text-xs text-muted italic">{bouture.espece}</p>
                <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                        {difficulte}
                    </p>
                    <p className="text-sm font-medium text-primary">
                        {bouture.prix} €
                    </p>
                </div>
            </div>
        </Link>
    );
}

export function BoutureBentoGrid({
    boutures,
}: {
    boutures: BouturePublique[];
}) {
    if (boutures.length === 0) {
        return (
            <p className="text-sm text-muted py-16 text-center">
                Aucun spécimen disponible pour le moment.
            </p>
        );
    }

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boutures.map((bouture, index) => {
                const config = BENTO_PATTERN[index % 5];
                const large = config.span === 2;

                return (
                    <div
                        key={bouture.id}
                        className={[
                            large ? 'lg:col-span-2' : 'lg:col-span-1',
                            config.colStartClass ?? '',
                        ]
                            .filter(Boolean)
                            .join(' ')}
                    >
                        <BentoCard bouture={bouture} large={large} />
                    </div>
                );
            })}
        </section>
    );
}
