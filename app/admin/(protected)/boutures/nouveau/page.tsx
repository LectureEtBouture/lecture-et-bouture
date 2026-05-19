import { PlanteForm } from '@/components/admin/PlanteForm';
import { createPlante } from '@/lib/actions/plantes';

export default function NouvellePlantePage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouvelle bouture
            </h1>
            <PlanteForm action={createPlante} />
        </div>
    );
}
