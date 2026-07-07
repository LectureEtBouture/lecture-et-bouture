import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getRayon, updateRayon } from '@/lib/actions/rayons';

type Props = { params: Promise<{ id: string }> };

export default async function ModifierRayonPage({ params }: Props) {
    const { id } = await params;
    const rayon = await getRayon(id);
    if (!rayon) notFound();

    const action = updateRayon.bind(null, rayon.id);

    return (
        <div className="space-y-6">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Modifier le rayon
            </h1>
            <form action={action} className="space-y-4 max-w-md">
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Nom
                    </label>
                    <input
                        name="nom"
                        defaultValue={rayon.nom}
                        required
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[11px] uppercase tracking-[0.1em] text-muted">
                        Description{' '}
                        <span className="normal-case">(optionnel)</span>
                    </label>
                    <textarea
                        name="description"
                        defaultValue={rayon.description ?? ''}
                        rows={3}
                        className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Enregistrer
                    </button>
                    <Link
                        href="/admin/rayons"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    );
}
