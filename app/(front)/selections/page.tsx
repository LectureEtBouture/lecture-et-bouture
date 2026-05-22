import type { Metadata } from 'next';
import { getPublicSelections } from '@/lib/queries/selections';
import { SelectionBlock } from './_components/SelectionBlock';

export const metadata: Metadata = {
    title: 'Sélections',
    description:
        'Les sélections du libraire — livres et boutures choisis avec soin par notre équipe.',
};

export const dynamic = 'force-dynamic';

export default async function SelectionsPage() {
    const selectionsData = await getPublicSelections();

    return (
        <div className="max-w-3xl mx-auto px-6 py-section">
            <header className="space-y-4 pb-10 border-b border-border">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Libraire
                </p>
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                    Sélections
                </h1>
            </header>

            {selectionsData.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-sm text-muted italic">
                        Aucune sélection disponible pour le moment.
                    </p>
                    <p className="text-[11px] text-muted/60 mt-2 uppercase tracking-[0.1em]">
                        Revenez bientôt.
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-border">
                    {selectionsData.map((selection, index) => (
                        <SelectionBlock
                            key={selection.id}
                            selection={selection}
                            index={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
