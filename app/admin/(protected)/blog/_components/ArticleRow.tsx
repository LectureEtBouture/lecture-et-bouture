import Link from 'next/link';
import type { ArticleItem } from '@/lib/queries/articles';
import {
    togglePublie,
    toggleEnAvant,
    deleteArticle,
} from '@/lib/actions/articles';

function PublieToggle({ id, publie }: { id: string; publie: boolean }) {
    return (
        <form action={togglePublie.bind(null, id)}>
            <button
                type="submit"
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${publie ? 'border-primary text-primary' : 'border-border text-muted'}`}
            >
                {publie ? 'Publié' : 'Brouillon'}
            </button>
        </form>
    );
}

function EnAvantToggle({ id, enAvant }: { id: string; enAvant: boolean }) {
    return (
        <form action={toggleEnAvant.bind(null, id)}>
            <button
                type="submit"
                className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border ${enAvant ? 'border-primary text-primary' : 'border-border text-muted'}`}
            >
                {enAvant ? '★ avant' : '☆ avant'}
            </button>
        </form>
    );
}

function DeleteButton({ id }: { id: string }) {
    return (
        <form
            action={async () => {
                'use server';
                await deleteArticle(id);
            }}
        >
            <button
                type="submit"
                className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
            >
                Supprimer
            </button>
        </form>
    );
}

export function ArticleRow({ article }: { article: ArticleItem }) {
    const date = new Date(article.publishedAt ?? article.createdAt);
    const dateStr = new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);

    return (
        <tr className="border-b border-border/40 hover:bg-surface/60">
            <td className="py-3 pr-4">
                <Link
                    href={`/admin/blog/${article.id}/modifier`}
                    className="text-sm text-foreground hover:text-primary transition-colors font-medium"
                >
                    {article.titre}
                </Link>
                {article.auteurNom && (
                    <p className="text-[11px] text-muted mt-0.5">
                        {article.auteurNom}
                    </p>
                )}
            </td>
            <td className="py-3 pr-4 text-[11px] text-muted whitespace-nowrap">
                {dateStr}
            </td>
            <td className="py-3 pr-4">
                <PublieToggle id={article.id} publie={article.publie} />
            </td>
            <td className="py-3 pr-4">
                <EnAvantToggle id={article.id} enAvant={article.enAvant} />
            </td>
            <td className="py-3 text-right">
                <div className="flex items-center justify-end gap-3">
                    <Link
                        href={`/admin/blog/${article.id}/modifier`}
                        className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
                    >
                        Modifier
                    </Link>
                    <DeleteButton id={article.id} />
                </div>
            </td>
        </tr>
    );
}
