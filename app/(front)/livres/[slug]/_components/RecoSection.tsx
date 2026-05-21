import Link from 'next/link';
import Image from 'next/image';
import { getCoverColor } from '@/lib/data';

type RecoLivre = {
    inventaireUri: string;
    slug: string;
    titre: string;
    auteur: string | null;
    imageUrl: string | null;
    genreIds: string[];
    noteMoyenne: string | null;
};

export function RecoSection({
    prefix,
    label,
    href,
    livres,
}: {
    prefix: string;
    label: string;
    href: string;
    livres: RecoLivre[];
}) {
    return (
        <div className="space-y-4 border-t border-border pt-10">
            <h2 className="text-xs uppercase tracking-widest text-muted">
                {prefix}
                {label && (
                    <>
                        {' '}
                        <Link
                            href={href}
                            className="hover:text-primary transition-colors"
                        >
                            {label}
                        </Link>
                    </>
                )}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {livres.map((livre) => {
                    const coverColor = getCoverColor(livre.genreIds?.[0]);
                    return (
                        <Link
                            key={livre.inventaireUri}
                            href={`/livres/${livre.slug}`}
                            className="group space-y-2"
                        >
                            <div
                                className="aspect-2/3 w-full relative overflow-hidden"
                                style={{ backgroundColor: coverColor }}
                            >
                                {livre.imageUrl && (
                                    <Image
                                        src={livre.imageUrl}
                                        alt={livre.titre}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 50vw, 160px"
                                    />
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug font-serif">
                                    {livre.titre}
                                </p>
                                <p className="text-[10px] text-muted mt-0.5">
                                    {livre.auteur}
                                </p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
