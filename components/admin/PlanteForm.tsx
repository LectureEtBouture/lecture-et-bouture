import type { InferSelectModel } from 'drizzle-orm';
import type { plantes } from '@/db/schema';
import { PlanteFormIdentite } from './PlanteFormIdentite';
import { PlanteFormEntretien } from './PlanteFormEntretien';
import { PlanteFormCommerce } from './PlanteFormCommerce';
import { PlanteFormContenu } from './PlanteFormContenu';

type Plante = InferSelectModel<typeof plantes>;

interface Props {
    action: (formData: FormData) => Promise<void>;
    plante?: Plante;
}

export function PlanteForm({ action, plante }: Props) {
    return (
        <form action={action} className="space-y-6 max-w-2xl">
            <PlanteFormIdentite plante={plante} />
            <PlanteFormEntretien plante={plante} />
            <PlanteFormCommerce plante={plante} />
            <PlanteFormContenu plante={plante} />
            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Enregistrer
                </button>
                <a
                    href="/admin/boutures"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                >
                    Annuler
                </a>
            </div>
        </form>
    );
}
