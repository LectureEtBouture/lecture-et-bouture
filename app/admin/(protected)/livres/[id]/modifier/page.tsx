import { notFound } from 'next/navigation';
import { LivreForm } from '@/components/admin/LivreForm';
import {
    getLivre,
    getGenres,
    getRayons,
    updateLivre,
} from '@/lib/actions/livres';

export default async function ModifierLivrePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [livre, genresList, rayonsList] = await Promise.all([
        getLivre(Number(id)),
        getGenres(),
        getRayons(),
    ]);

    if (!livre) notFound();

    const action = updateLivre.bind(null, livre.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier — {livre.titre}
            </h1>
            <LivreForm
                action={action}
                livre={livre}
                genresList={genresList}
                rayonsList={rayonsList}
            />
        </div>
    );
}
