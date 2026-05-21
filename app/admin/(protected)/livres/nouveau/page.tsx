import { LivreForm } from '@/components/admin/LivreForm';
import { createLivre } from '@/lib/actions/livres';
import { getGenres, getRayons } from '@/lib/actions/livres-meta';

export default async function NouveauLivrePage() {
    const [genresList, rayonsList] = await Promise.all([
        getGenres(),
        getRayons(),
    ]);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouveau livre
            </h1>
            <LivreForm
                action={createLivre}
                genresList={genresList}
                rayonsList={rayonsList}
            />
        </div>
    );
}
