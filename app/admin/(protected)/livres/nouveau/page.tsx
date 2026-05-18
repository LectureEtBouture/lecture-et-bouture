import { LivreForm } from '@/components/admin/LivreForm';
import { createLivre, getGenres } from '@/lib/actions/livres';

export default async function NouveauLivrePage() {
    const genresList = await getGenres();

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Nouveau livre
            </h1>
            <LivreForm action={createLivre} genresList={genresList} />
        </div>
    );
}
