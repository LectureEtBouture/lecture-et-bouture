import Link from 'next/link';
import type { getAvis } from '@/lib/actions/avis';
import { uriToSlug } from '@/lib/services/books/slug';

type Avis = Awaited<ReturnType<typeof getAvis>>[number];

export type BookMeta = { titre: string | null; imageUrl: string | null };

export function AvisRow({
    avis: a,
    bookMeta,
    children,
}: {
    avis: Avis;
    bookMeta?: BookMeta;
    children: React.ReactNode;
}) {
    const stars =
        a.note != null ? '★'.repeat(a.note) + '☆'.repeat(5 - a.note) : null;
    const typeLabel =
        a.type === 'livre' ? 'Livre' : a.type === 'article' ? 'Article' : 'Bouture';
    const uri = a.inventaireUri;
    const titre =
        a.type === 'article'
            ? (a.articleTitre ?? a.produitNom)
            : (bookMeta?.titre ??
              a.produitNom ??
              (uri ? uri.replace('isbn:', 'ISBN ') : null));
    const imageUrl = bookMeta?.imageUrl ?? null;

    return (
        <div className="bg-white border border-border px-5 py-4 space-y-2">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                    {imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={imageUrl}
                            alt=""
                            className="w-8 h-11 object-cover shrink-0 rounded-sm"
                        />
                    )}
                    <div className="space-y-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                            {a.auteurNom}
                        </p>
                        <p className="text-xs text-muted">
                            {typeLabel} ·{' '}
                            {a.type === 'article' && a.articleSlug ? (
                                <Link
                                    href={`/blog/${a.articleSlug}`}
                                    target="_blank"
                                    className="underline hover:text-primary"
                                >
                                    {titre ?? (
                                        <span className="italic">
                                            Article inconnu
                                        </span>
                                    )}
                                </Link>
                            ) : uri ? (
                                <Link
                                    href={`/livres/${uriToSlug(uri)}`}
                                    target="_blank"
                                    className="underline hover:text-primary"
                                >
                                    {titre ?? (
                                        <span className="italic">
                                            Produit inconnu
                                        </span>
                                    )}
                                </Link>
                            ) : (
                                (titre ?? (
                                    <span className="italic">
                                        Produit inconnu
                                    </span>
                                ))
                            )}
                        </p>
                        <p className="text-xs text-muted/70 tracking-wide">
                            {stars}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    {children}
                </div>
            </div>
            {a.texte && (
                <p className="text-sm text-foreground/75 border-t border-border/50 pt-2 mt-2">
                    {a.texte}
                </p>
            )}
            <p className="text-[11px] text-muted/60">
                {new Date(a.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                })}
            </p>
        </div>
    );
}
