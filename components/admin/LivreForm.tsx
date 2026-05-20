import type { InferSelectModel } from 'drizzle-orm';
import type { livres, genres, rayons } from '@/db/schema';
import { LivreFormIdentite } from './LivreFormIdentite';
import { LivreFormClassification } from './LivreFormClassification';
import { LivreFormCommerce } from './LivreFormCommerce';
import { LivreFormContenu } from './LivreFormContenu';
import { LivreFormLibrairie } from './LivreFormLibrairie';

type Livre = InferSelectModel<typeof livres>;
type Genre = InferSelectModel<typeof genres>;
type Rayon = InferSelectModel<typeof rayons>;

interface Props {
    action: (formData: FormData) => Promise<void>;
    livre?: Livre;
    selectedGenreIds?: string[];
    genresList: Genre[];
    rayonsList: Rayon[];
}

export function LivreForm({
    action,
    livre,
    selectedGenreIds = [],
    genresList,
    rayonsList,
}: Props) {
    return (
        <form action={action} className="space-y-6 max-w-2xl">
            <LivreFormIdentite livre={livre} />
            <LivreFormClassification
                selectedGenreIds={selectedGenreIds}
                rayonId={livre?.rayonId}
                genresList={genresList}
                rayonsList={rayonsList}
            />
            <LivreFormCommerce livre={livre} />
            <LivreFormContenu livre={livre} />
            <LivreFormLibrairie livre={livre} />
            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Enregistrer
                </button>
                <a
                    href="/admin/livres"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                >
                    Annuler
                </a>
            </div>
        </form>
    );
}
