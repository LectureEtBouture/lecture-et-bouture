import { notFound } from 'next/navigation';
import { getGenre, updateGenre } from '@/lib/actions/genres';

type Props = { params: Promise<{ id: string }> };

export default async function ModifierGenrePage({ params }: Props) {
    const { id } = await params;
    const genre = await getGenre(id);
    if (!genre) notFound();

    const action = updateGenre.bind(null, genre.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier le genre
            </h1>
            <form action={action} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Nom
                    </label>
                    <input
                        name="nom"
                        defaultValue={genre.nom}
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Enregistrer
                    </button>
                    <a
                        href="/admin/genres"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
