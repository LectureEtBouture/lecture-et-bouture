import { getTagsBlog } from '@/lib/queries/tags-blog';
import { createTagBlog, deleteTagBlog } from '@/lib/actions/tags-blog';
import { inputClass, labelClass } from '@/components/admin/formStyles';
import Link from 'next/link';

export default async function AdminBlogTagsPage() {
    const tags = await getTagsBlog();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Tags blog
                    </h1>
                    <p className="text-[11px] text-muted mt-0.5">
                        {tags.length} tag{tags.length > 1 ? 's' : ''}
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
                action={createTagBlog}
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
                <div className="flex-1">
                    <label className={labelClass} htmlFor="slug">
                        Slug (optionnel)
                    </label>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
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

            {tags.length === 0 ? (
                <p className="text-sm text-muted py-4 text-center">
                    Aucun tag.
                </p>
            ) : (
                <div className="divide-y divide-border/40">
                    {tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between py-3"
                        >
                            <div>
                                <p className="text-sm text-foreground">
                                    {tag.nom}
                                </p>
                                <p className="text-[11px] text-muted font-mono">
                                    {tag.slug}
                                </p>
                            </div>
                            <form
                                action={async () => {
                                    'use server';
                                    await deleteTagBlog(tag.id);
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
                    ))}
                </div>
            )}
        </div>
    );
}
