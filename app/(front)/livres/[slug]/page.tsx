import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLivreBySlug, getLivresPubliques } from '@/lib/queries/livres';
import { getGenreById } from '@/lib/queries/genres';
import { getRayonById } from '@/lib/queries/rayons';
import { getRecommendations } from '@/lib/queries/recommendations';
import { getAvisForLivre } from '@/lib/db/avis';
import { getCoverColor } from '@/lib/data';
import { CoverPanel } from './_components/CoverPanel';
import { NoteLibrairie } from './_components/NoteLibrairie';
import { RecoSection } from './_components/RecoSection';
import { LivreBreadcrumb } from './_components/LivreBreadcrumb';
import { LivreHeader } from './_components/LivreHeader';
import { AutresTomes } from './_components/AutresTomes';
import { AvisSection } from '@/components/ui/AvisSection';
import { VisitTracker } from '@/components/ui/VisitTracker';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const livre = await getLivreBySlug(slug);
    if (!livre) return {};
    return { title: livre.titre, description: livre.description ?? undefined };
}

export async function generateStaticParams() {
    const livres = await getLivresPubliques();
    return livres.map((livre) => ({ slug: livre.slug }));
}

export default async function LivrePage({ params }: Props) {
    const { slug } = await params;
    const livre = await getLivreBySlug(slug);
    if (!livre) notFound();

    const [genre, rayon, avis, reco] = await Promise.all([
        livre.genreId ? getGenreById(livre.genreId) : Promise.resolve(null),
        livre.rayonId ? getRayonById(livre.rayonId) : Promise.resolve(null),
        getAvisForLivre(livre.id),
        getRecommendations(livre.id, livre.serie ?? null, livre.genreId ?? null, livre.auteur),
    ]);
    const coverColor = getCoverColor(livre.genreId);

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <VisitTracker
                type="livre"
                slug={livre.slug}
                titre={livre.titre}
                auteur={livre.auteur}
                coverColor={coverColor}
                image={livre.image ?? undefined}
            />
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16">
                <CoverPanel
                    livre={livre}
                    coverColor={coverColor}
                    rayon={rayon ?? undefined}
                />

                <div className="space-y-10">
                    <LivreBreadcrumb
                        livre={livre}
                        genre={genre ?? undefined}
                        rayon={rayon ?? undefined}
                    />
                    <LivreHeader livre={livre} />

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

                    {livre.noteDeLaLibrairie && (
                        <NoteLibrairie note={livre.noteDeLaLibrairie} />
                    )}

                    {livre.serie && reco.memeSerie.length > 0 && (
                        <AutresTomes
                            serie={livre.serie}
                            tomes={reco.memeSerie}
                        />
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

                    <AvisSection avis={avis} itemId={livre.id} type="livre" />
                </div>
            </div>
        </div>
    );
}
