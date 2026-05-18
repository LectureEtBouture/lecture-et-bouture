import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    getLivreBySlug,
    getLivres,
    getGenreById,
    getRayonById,
    getAvisForLivre,
    getRecommendations,
    getCoverColor,
} from '@/lib/data';
import { CoverPanel } from './_components/CoverPanel';
import { RecoSection } from './_components/RecoSection';
import { Stars } from '@/components/ui/Stars';
import { AvisSection } from '@/components/ui/AvisSection';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const livre = getLivreBySlug(slug);
    if (!livre) return {};
    return { title: livre.titre, description: livre.description ?? undefined };
}

export async function generateStaticParams() {
    return getLivres().map((livre) => ({ slug: livre.slug }));
}

export default async function LivrePage({ params }: Props) {
    const { slug } = await params;
    const livre = getLivreBySlug(slug);
    if (!livre) notFound();

    const genre = getGenreById(livre.genreId ?? 0);
    const rayon = getRayonById(livre.rayonId);
    const avis = getAvisForLivre(livre.id);
    const reco = getRecommendations(livre);
    const coverColor = getCoverColor(livre.genreId);
    const noteMoyenne = livre.noteMoyenne
        ? parseFloat(livre.noteMoyenne)
        : null;

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16">
                <CoverPanel
                    livre={livre}
                    coverColor={coverColor}
                    rayon={rayon}
                />

                <div className="space-y-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-muted">
                        <Link
                            href="/livres"
                            className="hover:text-primary transition-colors"
                        >
                            Livres
                        </Link>
                        {rayon && (
                            <>
                                <span>·</span>
                                <Link
                                    href={`/livres?rayon=${livre.rayonId}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {rayon.nom}
                                </Link>
                            </>
                        )}
                        {genre && (
                            <>
                                <span>·</span>
                                <Link
                                    href={`/livres?genre=${livre.genreId}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {genre.nom}
                                </Link>
                            </>
                        )}
                        {livre.serie && (
                            <>
                                <span>·</span>
                                <Link
                                    href={`/livres?serie=${encodeURIComponent(livre.serie)}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {livre.serie}
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Titre */}
                    <div className="space-y-2">
                        {livre.serie && (
                            <p className="text-xs uppercase tracking-widest text-muted">
                                {livre.serie} · Tome {livre.numeroSerie}
                            </p>
                        )}
                        <h1 className="font-serif text-4xl font-bold text-foreground leading-tight tracking-tight">
                            {livre.titre}
                        </h1>
                        <Link
                            href={`/livres?q=${encodeURIComponent(livre.auteur)}`}
                            className="text-lg text-muted hover:text-primary transition-colors"
                        >
                            {livre.auteur}
                        </Link>
                        {noteMoyenne && (
                            <div className="flex items-center gap-2 pt-1">
                                <Stars note={noteMoyenne} />
                                <span className="text-xs text-muted">
                                    {noteMoyenne.toFixed(1)} / 5
                                </span>
                            </div>
                        )}
                        {livre.choixLibrairie && (
                            <span className="inline-block bg-background border border-border px-2 py-1 text-[7px] font-medium uppercase tracking-[0.12em] text-primary leading-tight mt-1">
                                Choix de la librairie
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {livre.description && (
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Description
                            </h2>
                            <p className="text-base text-foreground leading-relaxed max-w-[68ch]">
                                {livre.description}
                            </p>
                        </div>
                    )}

                    {/* Autres tomes */}
                    {reco.memeSerie.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Autres tomes —{' '}
                                <Link
                                    href={`/livres?serie=${encodeURIComponent(livre.serie!)}`}
                                    className="hover:text-primary transition-colors"
                                >
                                    {livre.serie}
                                </Link>
                            </h2>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                {reco.memeSerie.map((tome) => (
                                    <Link
                                        key={tome.id}
                                        href={`/livres/${tome.slug}`}
                                        className="group space-y-1"
                                    >
                                        <div
                                            className="aspect-2/3 w-full relative overflow-hidden"
                                            style={{
                                                backgroundColor: getCoverColor(
                                                    tome.genreId,
                                                ),
                                            }}
                                        >
                                            <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-widest text-foreground/50">
                                                T.{tome.numeroSerie}
                                            </span>
                                        </div>
                                        <p className="text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {tome.titre}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {reco.memeGenre.length > 0 && genre && (
                        <RecoSection
                            prefix="Dans le même genre"
                            label={genre.nom}
                            href={`/livres?genre=${livre.genreId}`}
                            livres={reco.memeGenre}
                        />
                    )}
                    {reco.memeAuteur.length > 0 && (
                        <RecoSection
                            prefix="Par"
                            label={livre.auteur}
                            href={`/livres?q=${encodeURIComponent(livre.auteur)}`}
                            livres={reco.memeAuteur}
                        />
                    )}

                    <AvisSection avis={avis} />
                </div>
            </div>
        </div>
    );
}
