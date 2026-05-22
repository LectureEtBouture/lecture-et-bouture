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

const CARD_BASE =
    'group flex flex-col lg:flex-row bg-surface h-full min-h-[240px] hover:shadow-[0_2px_12px_rgba(26,26,26,0.06)] transition-shadow duration-200';

const NOISE_OVERLAY = (
    <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply pointer-events-none"
        style={{
            backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
    />
);

function ColorBlock({
    coverColor,
    coverImage,
    nom,
    imageAlt,
}: {
    coverColor: string;
    coverImage: string | null;
    nom: string;
    imageAlt?: string | null;
}) {
    return (
        <div
            className="aspect-[4/3] lg:aspect-auto lg:w-[48%] flex-shrink-0 relative overflow-hidden"
            style={{ backgroundColor: coverColor }}
        >
            {coverImage ? (
                <Image
                    src={coverImage}
                    alt={imageAlt ?? nom}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 30vw"
                />
            ) : (
                NOISE_OVERLAY
            )}
        </div>
    );
}

function MetaTags({
    lumiere,
    difficulte,
}: {
    lumiere?: string;
    difficulte?: string;
}) {
    if (!lumiere && !difficulte) return null;
    return (
        <div className="flex items-center gap-3">
            {lumiere && (
                <span className="text-[10px] uppercase tracking-widest text-muted">
                    {lumiere}
                </span>
            )}
            {difficulte && (
                <span className="text-[10px] uppercase tracking-widest text-muted">
                    {difficulte}
                </span>
            )}
        </div>
    );
}

function LargeCard({ bouture }: { bouture: BouturePublique }) {
    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const coverImage = bouture.image ?? null;
    const difficulte = bouture.difficulte
        ? DIFFICULTE_LABELS[bouture.difficulte]
        : undefined;
    const lumiere = bouture.lumiere
        ? LUMIERE_LABELS[bouture.lumiere]
        : undefined;

    const meta = <MetaTags lumiere={lumiere} difficulte={difficulte} />;

    const nameBlock = (
        <div>
            <h3 className="font-serif text-xl font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                {bouture.nom}
            </h3>
            {bouture.espece && (
                <p className="text-sm text-muted italic mt-0.5">
                    {bouture.espece}
                </p>
            )}
        </div>
    );

    const priceRow = (
        <div className="flex items-center justify-between pt-1">
            {bouture.stock === 0 ? (
                <span className="text-[9px] uppercase tracking-widest text-border">
                    Sur commande
                </span>
            ) : (
                <span />
            )}
            <span className="text-sm font-medium text-primary">
                {bouture.prix} €
            </span>
        </div>
    );

    // Cas A — description présente (prioritaire), note en signal si elle existe
    if (bouture.description) {
        return (
            <Link href={`/boutures/${bouture.slug}`} className={CARD_BASE}>
                <ColorBlock
                    coverColor={coverColor}
                    coverImage={coverImage}
                    nom={bouture.nom}
                    imageAlt={bouture.imageAlt}
                />
                <div className="flex flex-col justify-between p-6 flex-1">
                    <div className="space-y-1.5">
                        {meta}
                        {nameBlock}
                    </div>
                    <div className="mt-6 space-y-3">
                        <p className="text-sm text-foreground leading-[1.7] line-clamp-3 max-w-[40ch]">
                            {bouture.description}
                        </p>
                        {bouture.noteDeLaLibrairie && (
                            <div className="flex items-baseline gap-2 pt-1 border-t border-border">
                                <span className="text-[9px] uppercase tracking-[0.12em] text-primary shrink-0">
                                    Note de la libraire
                                </span>
                                <p className="font-manuscript text-xs text-muted italic line-clamp-1 min-w-0">
                                    {bouture.noteDeLaLibrairie}
                                </p>
                            </div>
                        )}
                        {priceRow}
                    </div>
                </div>
            </Link>
        );
    }

    // Cas B — note uniquement (pas de description)
    if (bouture.noteDeLaLibrairie) {
        return (
            <Link href={`/boutures/${bouture.slug}`} className={CARD_BASE}>
                <ColorBlock
                    coverColor={coverColor}
                    coverImage={coverImage}
                    nom={bouture.nom}
                    imageAlt={bouture.imageAlt}
                />
                <div className="flex flex-col justify-between p-6 flex-1">
                    <div className="space-y-3">
                        {meta}
                        {nameBlock}
                        <div className="relative pt-2">
                            <span
                                className="absolute -top-1 left-0 font-serif text-4xl leading-none text-primary/15 select-none"
                                aria-hidden
                            >
                                &laquo;
                            </span>
                            <p className="font-manuscript text-[0.9375rem] text-foreground leading-[1.75] line-clamp-4 pl-5">
                                {bouture.noteDeLaLibrairie}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                        <span className="text-[9px] uppercase tracking-[0.12em] text-primary">
                            Note de la libraire
                        </span>
                        <span className="text-sm font-medium text-primary">
                            {bouture.prix} €
                        </span>
                    </div>
                </div>
            </Link>
        );
    }

    // Cas C — spécimen sans texte (image et/ou champs techniques uniquement)
    return (
        <Link href={`/boutures/${bouture.slug}`} className={CARD_BASE}>
            <ColorBlock
                coverColor={coverColor}
                coverImage={coverImage}
                nom={bouture.nom}
                imageAlt={bouture.imageAlt}
            />
            <div className="flex flex-col justify-between p-6 flex-1">
                <div className="space-y-4">
                    {meta}
                    {nameBlock}
                    <dl className="space-y-1.5 border-t border-border pt-3">
                        {bouture.famille && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-[9px] uppercase tracking-[0.1em] text-muted shrink-0">
                                    Famille
                                </dt>
                                <dd className="text-xs text-foreground text-right">
                                    {bouture.famille}
                                </dd>
                            </div>
                        )}
                        {lumiere && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-[9px] uppercase tracking-[0.1em] text-muted shrink-0">
                                    Lumière
                                </dt>
                                <dd className="text-xs text-foreground text-right">
                                    {lumiere}
                                </dd>
                            </div>
                        )}
                        {difficulte && (
                            <div className="flex justify-between gap-4">
                                <dt className="text-[9px] uppercase tracking-[0.1em] text-muted shrink-0">
                                    Difficulté
                                </dt>
                                <dd className="text-xs text-foreground text-right">
                                    {difficulte}
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>
                {priceRow}
            </div>
        </Link>
    );
}

function SmallCard({ bouture }: { bouture: BouturePublique }) {
    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const coverImage = bouture.image ?? null;
    const difficulte = bouture.difficulte
        ? DIFFICULTE_LABELS[bouture.difficulte]
        : undefined;
    const lumiere = bouture.lumiere
        ? LUMIERE_LABELS[bouture.lumiere]
        : undefined;

    return (
        <Link
            href={`/boutures/${bouture.slug}`}
            className="group block bg-surface hover:shadow-[0_2px_12px_rgba(26,26,26,0.06)] transition-shadow duration-200"
        >
            <div
                className="aspect-[3/4] w-full relative overflow-hidden"
                style={{ backgroundColor: coverColor }}
            >
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={bouture.imageAlt ?? bouture.nom}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                ) : (
                    NOISE_OVERLAY
                )}
            </div>
            <div className="p-4 space-y-1">
                {lumiere && (
                    <p className="text-[10px] uppercase tracking-widest text-muted">
                        {lumiere}
                    </p>
                )}
                <h3 className="font-serif text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                    {bouture.nom}
                </h3>
                <p className="text-xs text-muted italic">{bouture.espece}</p>
                <div className="flex items-center justify-between pt-2">
                    {difficulte && (
                        <p className="text-[10px] uppercase tracking-widest text-muted">
                            {difficulte}
                        </p>
                    )}
                    <p className="text-sm font-medium text-primary ml-auto">
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
                        {large ? (
                            <LargeCard bouture={bouture} />
                        ) : (
                            <SmallCard bouture={bouture} />
                        )}
                    </div>
                );
            })}
        </section>
    );
}
