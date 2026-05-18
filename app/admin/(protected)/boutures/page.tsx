import Link from 'next/link';
import { getPlantes, deletePlante } from '@/lib/actions/plantes';

export default async function AdminBouturesPage() {
    const data = await getPlantes();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Boutures
                </h1>
                <Link
                    href="/admin/(protected)/boutures/nouveau"
                    className="px-4 py-2 bg-[#2D4B3E] text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors"
                >
                    Ajouter
                </Link>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted">
                    Aucune plante pour l&apos;instant.
                </p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-2 text-xs uppercase tracking-widest text-muted font-normal">
                                Nom
                            </th>
                            <th className="text-left py-2 text-xs uppercase tracking-widest text-muted font-normal">
                                Espèce
                            </th>
                            <th className="text-left py-2 text-xs uppercase tracking-widest text-muted font-normal">
                                Prix
                            </th>
                            <th className="text-left py-2 text-xs uppercase tracking-widest text-muted font-normal">
                                Difficulté
                            </th>
                            <th />
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((plante) => (
                            <tr
                                key={plante.id}
                                className="border-b border-border/50 hover:bg-white transition-colors"
                            >
                                <td className="py-3 pr-4 font-medium text-foreground">
                                    {plante.nom}
                                </td>
                                <td className="py-3 pr-4 text-muted italic">
                                    {plante.espece ?? '—'}
                                </td>
                                <td className="py-3 pr-4 text-[#2D4B3E]">
                                    {plante.prix} €
                                </td>
                                <td className="py-3 pr-4 text-muted">
                                    {plante.difficulte ?? '—'}
                                </td>
                                <td className="py-3 text-right space-x-4">
                                    <Link
                                        href={`/admin/boutures/${plante.id}/modifier`}
                                        className="text-xs text-muted hover:text-[#2D4B3E] transition-colors"
                                    >
                                        Modifier
                                    </Link>
                                    <form
                                        action={async () => {
                                            'use server';
                                            await deletePlante(plante.id);
                                        }}
                                        className="inline"
                                    >
                                        <button
                                            type="submit"
                                            className="text-xs text-muted hover:text-red-600 transition-colors"
                                        >
                                            Supprimer
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
