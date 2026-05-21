import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getLivresMisEnAvant } from '@/lib/queries/livres';
import { getGenreById } from '@/lib/queries/genres';
import { getCoverColor } from '@/lib/data';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Me faire surprendre',
    description: 'Un livre choisi par notre équipe, rien que pour vous.',
};

function pickRandom<T>(items: T[]): T | undefined {
    return items[Math.floor(Math.random() * items.length)];
}

export default async function SurprendrePage() {
    const candidats = await getLivresMisEnAvant();
    const livre = pickRandom(candidats);

    if (!livre) {
        return (
            <div className="max-w-xl mx-auto px-6 py-32 text-center">
                <p className="text-sm text-muted">
                    Aucun choix de librairie disponible pour le moment.
                </p>
                <Link
                    href="/livres"
                    className="mt-8 inline-block text-[11px] uppercase tracking-[0.1em] font-medium text-primary hover:text-foreground transition-colors"
                >
                    Parcourir le catalogue &rarr;
                </Link>
            </div>
        );
    }

    const primaryGenreId = livre.genreIds?.[0];
    const coverColor = getCoverColor(primaryGenreId);
    const genre = primaryGenreId ? await getGenreById(primaryGenreId) : null;
    const coverImage = livre.imageUrl ?? null;
    const isbn = livre.isbn;
    const achatUrl = isbn
        ? `https://www.leslibraires.fr/recherche/?q=${isbn}`
        : `https://www.leslibraires.fr/recherche/?q=${encodeURIComponent(livre.titre)}`;

    return (
        <div className="max-w-4xl mx-auto px-6 py-16 lg:py-24">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-16">
                Le choix du conservateur
            </p>

            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-12 lg:gap-20 items-start">
                <div
                    className="aspect-book w-full max-w-[220px] relative overflow-hidden"
                    style={{ backgroundColor: coverColor }}
                >
                    {coverImage && (
                        <Image
                            src={coverImage}
                            alt={livre.titre}
                            fill
                            className="object-cover"
                            sizes="220px"
                            priority
                        />
                    )}
                </div>

                <div className="space-y-8">
                    <div className="space-y-2">
                        {genre && (
                            <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                                {genre.nom}
                            </p>
                        )}
                        <h1 className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-bold text-foreground leading-[1.1] tracking-[-0.02em]">
                            {livre.titre}
                        </h1>
                        <p className="text-lg text-muted">{livre.auteur}</p>
                        <p className="text-base font-medium text-primary pt-1">
                            {livre.prix} €
                        </p>
                    </div>

                    {livre.noteDeLaLibrairie && (
                        <div className="space-y-3 border-l border-border pl-6">
                            <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                                Pourquoi on aime ce livre
                            </p>
                            <p className="text-base text-foreground leading-[1.75] max-w-[60ch]">
                                {livre.noteDeLaLibrairie}
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                        <a
                            href={achatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-primary text-background px-8 py-3.5 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors duration-200 hover:bg-primary-light text-center"
                        >
                            Acheter chez leslibraires.fr
                        </a>
                        <Link
                            href="/surprendre"
                            className="inline-block border border-border text-foreground px-8 py-3.5 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors duration-200 hover:border-primary hover:text-primary text-center"
                        >
                            Autre suggestion
                        </Link>
                    </div>

                    <p className="text-xs text-muted">
                        Ou{' '}
                        <Link
                            href={`/livres/${livre.slug}`}
                            className="underline underline-offset-4 hover:text-primary transition-colors"
                        >
                            voir la fiche complète
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
