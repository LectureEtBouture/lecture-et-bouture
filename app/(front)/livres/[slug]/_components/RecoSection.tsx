import Link from 'next/link';
import { getCoverColor } from '@/lib/data';

type RecoLivre = {
    id: string;
    slug: string;
    titre: string;
    auteur: string;
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
                {prefix}{' '}
                <Link
                    href={href}
                    className="hover:text-primary transition-colors"
                >
                    {label}
                </Link>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {livres.map((livre) => (
                    <Link
                        key={livre.id}
                        href={`/livres/${livre.slug}`}
                        className="group space-y-2"
                    >
                        <div
                            className="aspect-2/3 w-full relative overflow-hidden"
                            style={{
                                backgroundColor: getCoverColor(
                                    livre.genreIds?.[0],
                                ),
                            }}
                        />
                        <div>
                            <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug font-serif">
                                {livre.titre}
                            </p>
                            <p className="text-[10px] text-muted mt-0.5">
                                {livre.auteur}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
