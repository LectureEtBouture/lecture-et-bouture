import Link from 'next/link';
import { getSelections, deleteSelection } from '@/lib/actions/selections';

export default async function AdminSelectionsPage() {
    const data = await getSelections();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Sélections
                </h1>
                <Link
                    href="/admin/selections/nouvelle"
                    className="px-4 py-2 bg-[#2D4B3E] text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors"
                >
                    Créer
                </Link>
            </div>

            {data.length === 0 ? (
                <p className="text-sm text-muted">
                    Aucune sélection pour l&apos;instant.
                </p>
            ) : (
                <div className="space-y-3">
                    {data.map((s) => (
                        <div
                            key={s.id}
                            className="bg-white border border-border px-5 py-4 flex items-center justify-between"
                        >
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-foreground">
                                    {s.titre}
                                </p>
                                <p className="text-xs text-muted">
                                    Ordre {s.ordre} ·{' '}
                                    {s.active ? 'Active' : 'Inactive'}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/admin/selections/${s.id}`}
                                    className="text-xs text-muted hover:text-[#2D4B3E] transition-colors"
                                >
                                    Gérer les items
                                </Link>
                                <Link
                                    href={`/admin/selections/${s.id}/modifier`}
                                    className="text-xs text-muted hover:text-[#2D4B3E] transition-colors"
                                >
                                    Modifier
                                </Link>
                                <form
                                    action={async () => {
                                        'use server';
                                        await deleteSelection(s.id);
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
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
