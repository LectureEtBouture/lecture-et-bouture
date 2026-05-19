import Image from 'next/image';
import type { LivrePublique } from '@/lib/queries/livres';

function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function CoverPanel({
    livre,
    coverColor,
    rayon,
}: {
    livre: LivrePublique;
    coverColor: string;
    rayon?: { nom: string };
}) {
    const mainImage = livre.image ?? null;

    const rawFields: { label: string; value: string | null | undefined }[] = [
        { label: 'Prix', value: `${livre.prix} €` },
        ...(rayon ? [{ label: 'Rayon', value: rayon.nom }] : []),
        { label: 'Éditeur', value: livre.editeur },
        ...(livre.collection
            ? [{ label: 'Collection', value: livre.collection }]
            : []),
        ...(livre.format
            ? [{ label: 'Format', value: capitalize(livre.format) }]
            : []),
        ...(livre.anneePublication
            ? [{ label: 'Publication', value: String(livre.anneePublication) }]
            : []),
        { label: 'ISBN', value: livre.isbn },
        ...(livre.edition ? [{ label: 'Édition', value: livre.edition }] : []),
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
                {mainImage ? (
                    <Image
                        src={mainImage}
                        alt={livre.titre}
                        fill
                        className="object-cover"
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

            <div className="flex items-center gap-2.5">
                <span
                    className={`w-2 h-2 rounded-full shrink-0 ${livre.stock > 0 ? 'bg-primary' : 'bg-border'}`}
                />
                <span className="text-[10px] uppercase tracking-widest text-muted">
                    {livre.stock > 0 ? 'Disponible en magasin' : 'Sur commande'}
                </span>
            </div>

            <div className="space-y-3">
                <a
                    href={`https://www.leslibraires.fr/recherche/?q=${encodeURIComponent(livre.titre + ' ' + livre.auteur)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 bg-primary text-background text-xs uppercase tracking-widest text-center hover:bg-primary-light transition-colors"
                >
                    Voir sur leslibraires.fr
                </a>
                <p className="text-xs text-muted text-center">
                    Achat via notre librairie partenaire
                </p>
            </div>

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
        </div>
    );
}
