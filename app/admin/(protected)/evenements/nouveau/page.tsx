import { EvenementForm } from '@/components/admin/EvenementForm';
import { createEvenement } from '@/lib/actions/evenements';

export default function NouvelEvenementPage() {
    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouvel événement
            </h1>
            <EvenementForm action={createEvenement} />
        </div>
    );
}
