import { notFound } from 'next/navigation';
import { EvenementForm } from '@/components/admin/EvenementForm';
import { getEvenement, updateEvenement } from '@/lib/actions/evenements';

export default async function ModifierEvenementPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const evenement = await getEvenement(Number(id));
    if (!evenement) notFound();

    const action = updateEvenement.bind(null, evenement.id);
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier — {evenement.titre}
            </h1>
            <EvenementForm action={action} evenement={evenement} />
        </div>
    );
}
