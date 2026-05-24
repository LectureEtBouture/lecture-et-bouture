import { getAuteursBlog } from '@/lib/queries/auteurs-blog';
import { createAuteurBlog, deleteAuteurBlog } from '@/lib/actions/auteurs-blog';
import { inputClass, labelClass } from '@/components/admin/formStyles';
import Link from 'next/link';

export default async function AdminBlogAuteursPage() {
    const auteurs = await getAuteursBlog();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Auteurs blog
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {auteurs.length} auteur{auteurs.length > 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    href="/admin/blog"
                    className="text-[11px] text-muted hover:text-foreground transition-colors"
                >
                    ← Blog
                </Link>
            </div>

            <form
                action={createAuteurBlog}
                className="flex gap-3 items-end pb-6 border-b border-border/60"
            >
                <div className="flex-1">
                    <label className={labelClass} htmlFor="nom">
                        Nom
                    </label>
                    <input
                        id="nom"
                        name="nom"
                        type="text"
                        required
                        className={inputClass}
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors whitespace-nowrap"
                >
                    Ajouter
                </button>
            </form>

            {auteurs.length === 0 ? (
                <p className="text-sm text-muted py-4 text-center">
                    Aucun auteur enregistré.
                </p>
            ) : (
                <div className="divide-y divide-border/40">
                    {auteurs.map((auteur) => (
                        <div
                            key={auteur.id}
                            className="flex items-center justify-between py-3"
                        >
                            <p className="text-sm text-foreground">
                                {auteur.nom}
                            </p>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/admin/blog/auteurs/${auteur.id}/modifier`}
                                    className="text-xs text-muted hover:text-primary transition-colors"
                                >
                                    Modifier
                                </Link>
                                <form
                                    action={async () => {
                                        'use server';
                                        await deleteAuteurBlog(auteur.id);
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
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
