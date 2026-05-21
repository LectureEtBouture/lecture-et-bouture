import { CoverImage } from '@/components/ui/CoverImage';
import type { LivreComplet } from '@/lib/queries/livres';
import { uriToISBN } from '@/lib/services/books/slug';

export function CoverPanel({
    livre,
    coverColor,
    rayon,
}: {
    livre: LivreComplet;
    coverColor: string;
    rayon?: { nom: string };
}) {
    const isbn = uriToISBN(livre.inventaireUri) ?? livre.isbn;
    const achatUrl = isbn
        ? `https://www.leslibraires.fr/recherche/?q=${isbn}`
        : `https://www.leslibraires.fr/recherche/?q=${encodeURIComponent(livre.titre)}`;

    function formatDate(raw: string | null | undefined): string | null {
        if (!raw) return null;
        const parts = raw.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        if (parts.length === 2) return `${parts[1]}/${parts[0]}`;
        return raw;
    }

    const rawFields: { label: string; value: string | null | undefined }[] = [
        ...(livre.prix
            ? [{ label: 'Prix', value: `${livre.prix} € (indicatif)` }]
            : []),
        ...(livre.prixNumerique
            ? [{ label: 'Ebook', value: `${livre.prixNumerique.toFixed(2)} €` }]
            : []),
        ...(rayon ? [{ label: 'Rayon', value: rayon.nom }] : []),
        { label: 'Éditeur', value: livre.editeur },
        ...(livre.publishedDateRaw
            ? [
                  {
                      label: 'Publication',
                      value: formatDate(livre.publishedDateRaw),
                  },
              ]
            : livre.anneePublication
              ? [
                    {
                        label: 'Publication',
                        value: String(livre.anneePublication),
                    },
                ]
              : []),
        ...(livre.nombrePages
            ? [{ label: 'Pages', value: String(livre.nombrePages) }]
            : []),
        { label: 'ISBN', value: isbn },
        ...(livre.serie
            ? [
                  {
                      label: 'Série',
                      value: `${livre.serie} · Tome ${livre.numeroSerie}`,
                  },
              ]
            : []),
    ];
    const fields = rawFields.filter(
        (field): field is { label: string; value: string } =>
            field.value != null,
    );

    return (
        <div className="space-y-6">
            <div
                className="aspect-book w-full relative overflow-hidden"
                style={{ backgroundColor: coverColor }}
            >
                {livre.imageUrl ? (
                    <CoverImage
                        src={livre.imageUrl}
                        alt={livre.imageAlt ?? livre.titre}
                        sizes="280px"
                        priority
                    />
                ) : (
                    <div
                        className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
                        style={{
                            backgroundImage:
                                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                        }}
                    />
                )}
                {livre.serie && livre.numeroSerie && (
                    <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-widest text-foreground/50 drop-shadow-sm">
                        Tome {livre.numeroSerie}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <a
                    href={achatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-primary text-background text-xs uppercase tracking-widest text-center hover:bg-primary-light transition-colors"
                >
                    Voir sur leslibraires.fr
                </a>
                {livre.previewLink && (
                    <a
                        href={livre.previewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2.5 border border-border text-xs uppercase tracking-widest text-center text-muted hover:text-foreground hover:border-foreground transition-colors"
                    >
                        Aperçu Google Books
                    </a>
                )}
                <p className="text-[10px] text-muted text-center leading-relaxed">
                    Soutenez votre librairie indépendante
                    <br />
                    Lecture &amp; Bouture
                </p>
            </div>

            {fields.length > 0 && (
                <dl className="space-y-2 border-t border-border pt-4">
                    {fields.map(({ label, value }) => (
                        <div key={label} className="flex justify-between gap-4">
                            <dt className="text-[10px] uppercase tracking-widest text-muted shrink-0">
                                {label}
                            </dt>
                            <dd className="text-xs text-foreground text-right">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            )}

            {livre.isEbook && (
                <p className="text-[10px] uppercase tracking-widest text-muted border-t border-border pt-4">
                    Disponible en ebook
                </p>
            )}
        </div>
    );
}
