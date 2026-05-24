import type { BouturePublique } from '@/lib/queries/boutures';
import { LargeCard, SmallCard } from './BoutureBentoCard';

// Pattern bento pour 5 items, répété par blocs de 5 au-delà
// span=2 → grande carte, span=1 → petite carte
const BENTO_PATTERN: { span: 1 | 2; colStartClass?: string }[] = [
    { span: 2 },
    { span: 1 },
    { span: 1 },
    { span: 2 },
    { span: 2, colStartClass: 'lg:col-start-2' },
];

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
