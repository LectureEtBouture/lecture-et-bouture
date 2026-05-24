import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { sanitizeRte } from '@/lib/sanitize';
import {
    getLivreBySlug,
    getMemeAuteur,
    getMemeCategorie,
} from '@/lib/queries/livres';
import { getGenreById } from '@/lib/queries/genres';
import { getRayonById } from '@/lib/queries/rayons';
import { getRecommendations } from '@/lib/queries/recommendations';
import { getAvisForLivre } from '@/lib/db/avis';
import { getCoverColor } from '@/lib/data';
import { translateCategory } from '@/lib/services/books/categories-fr';
import { CoverPanel } from './_components/CoverPanel';
import { NoteLibrairie } from './_components/NoteLibrairie';
import { RecoSection } from './_components/RecoSection';
import { LivreBreadcrumb } from './_components/LivreBreadcrumb';
import { LivreHeader } from './_components/LivreHeader';
import { AvisSection } from '@/components/ui/AvisSection';
import { VisitTracker } from '@/components/ui/VisitTracker';
import { WishlistButton } from '@/components/ui/WishlistButton';
import { ShareButton } from '@/components/ui/ShareButton';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const livre = await getLivreBySlug(slug);
    if (!livre) return {};
    return { title: livre.titre, description: livre.description ?? undefined };
}

export default async function LivrePage({ params }: Props) {
    const { slug } = await params;
    const livre = await getLivreBySlug(slug);
    if (!livre) notFound();

    const primaryGenreId = livre.genreIds?.[0];
    const [genre, rayon, avis, reco, livresMemeAuteur, livresMemeCategorie] =
        await Promise.all([
            primaryGenreId
                ? getGenreById(primaryGenreId)
                : Promise.resolve(null),
            livre.rayonId ? getRayonById(livre.rayonId) : Promise.resolve(null),
            livre.localId
                ? getAvisForLivre(livre.localId)
                : Promise.resolve([]),
            livre.localId !== null && primaryGenreId
                ? getRecommendations(livre.localId, primaryGenreId)
                : Promise.resolve({ memeGenre: [] }),
            livre.auteur
                ? getMemeAuteur(livre.auteur, livre.inventaireUri)
                : Promise.resolve([]),
            livre.categories.length > 0
                ? getMemeCategorie(livre.categories, livre.inventaireUri)
                : Promise.resolve([]),
        ]);
    const coverColor = getCoverColor(primaryGenreId);

    // descriptionAdmin (saisie BO) prioritaire — toujours affichée sans filtre langue
    // description (Google Books) — masquée si langue ≠ fr ou texte < 20 chars
    const descriptionHtml = (() => {
        if (livre.descriptionAdmin) {
            const sanitized = sanitizeRte(livre.descriptionAdmin);
            return sanitized.replace(/<[^>]*>/g, '').trim().length >= 20
                ? sanitized
                : null;
        }
        if (livre.description) {
            const sanitized = sanitizeRte(livre.description);
            const text = sanitized.replace(/<[^>]*>/g, '').trim();
            return text.length >= 20 &&
                (livre.language === 'fr' || livre.language === null)
                ? sanitized
                : null;
        }
        return null;
    })();

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <VisitTracker
                type="livre"
                slug={livre.slug}
                titre={livre.titre}
                auteur={livre.auteur ?? ''}
                coverColor={coverColor}
                image={livre.imageUrl ?? undefined}
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

                    <div className="flex items-center gap-2">
                        <WishlistButton
                            slug={livre.slug}
                            titre={livre.titre}
                            auteur={livre.auteur ?? undefined}
                            coverColor={coverColor}
                            image={livre.imageUrl ?? undefined}
                        />
                        <ShareButton titre={livre.titre} />
                    </div>

                    {descriptionHtml && (
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Description
                            </h2>
                            <div
                                className="text-base text-foreground leading-relaxed max-w-[68ch] [&_p]:mb-3 [&_p:last-child]:mb-0"
                                // Content sanitized server-side via sanitizeRte (sanitize-html)
                                dangerouslySetInnerHTML={{
                                    __html: descriptionHtml,
                                }}
                            />
                        </div>
                    )}

                    {livre.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {livre.categories.map((categorie) => (
                                <span
                                    key={categorie}
                                    className="text-[10px] uppercase tracking-widest text-muted border border-border px-2 py-1"
                                >
                                    {translateCategory(categorie)}
                                </span>
                            ))}
                        </div>
                    )}

                    {livre.noteDeLaLibrairie && (
                        <NoteLibrairie note={livre.noteDeLaLibrairie} />
                    )}

                    <AvisSection
                        avis={avis}
                        itemId={livre.inventaireUri}
                        type="livre"
                    />

                    {reco.memeGenre.length > 0 && genre && (
                        <RecoSection
                            prefix="Dans le même genre"
                            label={genre.nom}
                            href={`/livres?genre=${primaryGenreId}`}
                            livres={reco.memeGenre}
                        />
                    )}

                    {livresMemeAuteur.length > 0 && livre.auteur && (
                        <RecoSection
                            prefix="Du même auteur"
                            label={livre.auteur}
                            href={`/livres?q=${encodeURIComponent(`inauthor:"${livre.auteur}"`)}`}
                            livres={livresMemeAuteur}
                        />
                    )}

                    {livresMemeCategorie.length > 0 && (
                        <RecoSection
                            prefix="Dans le même univers"
                            label=""
                            href={`/livres?cat=${encodeURIComponent(livre.categories[0] ?? '')}`}
                            livres={livresMemeCategorie}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
