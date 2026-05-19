import type { Metadata } from 'next';
import { getBouturesPubliques } from '@/lib/queries/boutures';
import { BoutureIntro } from './_components/BoutureIntro';
import { BoutureBentoInfinite } from './_components/BoutureBentoInfinite';

export const metadata: Metadata = {
    title: 'Boutures',
    description:
        'Spécimens végétaux soignés — une sélection de boutures rares et de caractère.',
};

const PAGE_SIZE = 10;

export default async function BouturesPage() {
    const boutures = await getBouturesPubliques({ limit: PAGE_SIZE, offset: 0 });

    return (
        <div className="max-w-6xl mx-auto px-6 py-section space-y-section">
            <header className="space-y-4">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Spécimens végétaux
                </p>
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                    Boutures
                </h1>
                <p className="text-base text-muted leading-[1.75] max-w-[52ch]">
                    Une sélection de spécimens choisis pour leur caractère et
                    leur rareté. Chaque bouture est présentée avec ses besoins
                    et son histoire.
                </p>
            </header>

            <BoutureIntro />
            <BoutureBentoInfinite initialItems={boutures} />
        </div>
    );
}
