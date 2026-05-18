import type { Metadata } from 'next';
import {
    getBoutures,
    getBouturesMisEnAvant,
    type SortBoutures,
} from '@/lib/data';
import { BouturesFilterBar } from './_components/BouturesFilterBar';
import { BouturesSearchBar } from './_components/BouturesSearchBar';
import { BoutureCard } from './_components/BoutureCard';

export const metadata: Metadata = {
    title: 'Boutures',
    description: "Boutures et plantes d'intérieur — une sélection soignée.",
};

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

export default async function BouturesPage({ searchParams }: Props) {
    const params = await searchParams;

    const difficulte = params.difficulte ?? undefined;
    const lumiere = params.lumiere ?? undefined;
    const arrosage = params.arrosage ?? undefined;
    const sort = (params.sort as SortBoutures) ?? undefined;
    const q = params.q ?? undefined;
    const choixLibrairie = params.choix === '1' ? true : undefined;

    const isFiltered = !!(
        q ||
        difficulte ||
        lumiere ||
        arrosage ||
        choixLibrairie
    );

    const boutures = getBoutures({
        difficulte,
        lumiere,
        arrosage,
        sort,
        q,
        choixLibrairie,
    });
    const misEnAvant = isFiltered ? [] : getBouturesMisEnAvant();

    return (
        <div className="max-w-6xl mx-auto px-6 py-16 space-y-10">
            <h1 className="font-serif text-4xl font-bold text-foreground tracking-tight">
                Boutures
            </h1>

            <BouturesSearchBar value={q ?? ''} />

            <BouturesFilterBar
                activeDifficulte={difficulte}
                activeLumiere={lumiere}
                activeArrosage={arrosage}
                activeSort={sort}
                activeChoixLibrairie={!!choixLibrairie}
            />

            {isFiltered ? (
                <div className="space-y-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted">
                        {boutures.length} bouture
                        {boutures.length !== 1 ? 's' : ''}
                        {q && (
                            <>
                                {' '}
                                pour{' '}
                                <em className="not-italic font-medium text-foreground">
                                    &#34;{q}&#34;
                                </em>
                            </>
                        )}
                    </p>
                    {boutures.length === 0 ? (
                        <p className="text-sm text-muted">Aucun résultat.</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {boutures.map((bouture) => (
                                <BoutureCard
                                    key={bouture.id}
                                    bouture={bouture}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-14">
                    {misEnAvant.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-baseline gap-4">
                                <h2 className="font-serif text-xl font-bold text-foreground">
                                    Choix de la librairie
                                </h2>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {misEnAvant.map((bouture) => (
                                    <BoutureCard
                                        key={bouture.id}
                                        bouture={bouture}
                                        featured
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    <section className="space-y-6">
                        <div className="flex items-baseline gap-4">
                            <h2 className="font-serif text-xl font-bold text-foreground">
                                Tout le catalogue
                            </h2>
                            <span className="text-xs uppercase tracking-widest text-muted">
                                {boutures.length} bouture
                                {boutures.length !== 1 ? 's' : ''}
                            </span>
                            <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {boutures.map((bouture) => (
                                <BoutureCard
                                    key={bouture.id}
                                    bouture={bouture}
                                />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
