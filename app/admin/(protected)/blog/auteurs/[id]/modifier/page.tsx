import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import { auteursBlog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { updateAuteurBlog } from '@/lib/actions/auteurs-blog';
import { inputClass, labelClass } from '@/components/admin/formStyles';

export default async function ModifierAuteurPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const [auteur] = await db
        .select()
        .from(auteursBlog)
        .where(eq(auteursBlog.id, id))
        .limit(1);
    if (!auteur) notFound();

    const action = updateAuteurBlog.bind(null, id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Modifier l&apos;auteur
                </h1>
                <Link
                    href="/admin/blog/auteurs"
                    className="text-[11px] text-muted hover:text-foreground transition-colors"
                >
                    ← Auteurs
                </Link>
            </div>
            <form action={action} className="space-y-4 max-w-sm">
                <div>
                    <label className={labelClass} htmlFor="nom">
                        Nom
                    </label>
                    <input
                        id="nom"
                        name="nom"
                        type="text"
                        required
                        defaultValue={auteur.nom}
                        className={inputClass}
                    />
                </div>
                <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Enregistrer
                </button>
            </form>
        </div>
    );
}
