import Link from 'next/link';
import { getGenresList, deleteGenre } from '@/lib/actions/genres';

export default async function AdminGenresPage() {
    const data = await getGenresList();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Genres
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {data.length} genre{data.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/genres/nouveau"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted py-8 text-center">
                    Aucun genre.
                </p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Nom
                                </th>
                                <th className="text-left py-2 pr-4 text-[11px] uppercase tracking-[0.1em] text-muted font-normal hidden sm:table-cell">
                                    Slug
                                </th>
                                <th className="text-right py-2 text-[11px] uppercase tracking-[0.1em] text-muted font-normal">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((genre) => (
                                <tr
                                    key={genre.id}
                                    className="border-b border-border/50 hover:bg-white transition-colors px-4"
                                >
                                    <td className="py-3 pr-4 font-medium text-foreground">
                                        {genre.nom}
                                    </td>
                                    <td className="py-3 pr-4 text-muted font-mono text-xs hidden sm:table-cell">
                                        {genre.slug}
                                    </td>
                                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-4">
                                            <Link
                                                href={`/admin/genres/${genre.id}/modifier`}
                                                className="text-xs text-muted hover:text-primary transition-colors"
                                            >
                                                Modifier
                                            </Link>
                                            <form
                                                action={async () => {
                                                    'use server';
                                                    await deleteGenre(genre.id);
                                                }}
                                                className="contents"
                                            >
                                                <button
                                                    type="submit"
                                                    className="text-xs text-muted hover:text-red-600 transition-colors"
                                                >
                                                    Supprimer
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
