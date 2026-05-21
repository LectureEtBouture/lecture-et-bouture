import { notFound } from 'next/navigation';
import { LivreForm } from '@/components/admin/LivreForm';
import { getLivre, updateLivre } from '@/lib/actions/livres';
import {
    getGenres,
    getRayons,
    getLivreGenreIds,
} from '@/lib/actions/livres-meta';

export default async function ModifierLivrePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [livre, selectedGenreIds, genresList, rayonsList] = await Promise.all(
        [getLivre(id), getLivreGenreIds(id), getGenres(), getRayons()],
    );

    if (!livre) notFound();

    const action = updateLivre.bind(null, livre.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier — {livre.titre ?? livre.inventaireUri}
            </h1>
            <LivreForm
                action={action}
                livre={livre}
                selectedGenreIds={selectedGenreIds}
                genresList={genresList}
                rayonsList={rayonsList}
            />
        </div>
    );
}
