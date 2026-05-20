import { notFound } from 'next/navigation';
import { PlanteForm } from '@/components/admin/PlanteForm';
import { getPlante, updatePlante } from '@/lib/actions/plantes';

export default async function ModifierPlantePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const plante = await getPlante(id);

    if (!plante) notFound();

    const action = updatePlante.bind(null, plante.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier — {plante.nom}
            </h1>
            <PlanteForm action={action} plante={plante} />
        </div>
    );
}
