import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBoutureBySlug, getBouturesPubliques } from '@/lib/queries/boutures';
import { getBoutureCoverColor, DIFFICULTE_LABELS } from '@/lib/data';
import { getAvisForBouture } from '@/lib/db/avis';
import { CoverPanel } from './_components/CoverPanel';
import { NoteLibrairie } from '@/app/(front)/livres/[slug]/_components/NoteLibrairie';
import { Stars } from '@/components/ui/Stars';
import { AvisSection } from '@/components/ui/AvisSection';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const bouture = await getBoutureBySlug(slug);
    if (!bouture) return {};
    return {
        title: bouture.nom,
        description: bouture.description ?? undefined,
    };
}

export async function generateStaticParams() {
    const boutures = await getBouturesPubliques();
    return boutures.map((bouture) => ({ slug: bouture.slug }));
}

export default async function BouturePage({ params }: Props) {
    const { slug } = await params;
    const bouture = await getBoutureBySlug(slug);
    if (!bouture) notFound();

    const avis = await getAvisForBouture(bouture.id);
    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const noteMoyenne = bouture.noteMoyenne
        ? parseFloat(bouture.noteMoyenne)
        : null;

    return (
        <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-16">
                <CoverPanel bouture={bouture} coverColor={coverColor} />

                <div className="space-y-10">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-muted">
                        <Link
                            href="/boutures"
                            className="hover:text-primary transition-colors"
                        >
                            Boutures
                        </Link>
                        <span>·</span>
                        {bouture.difficulte && (
                            <Link
                                href={`/boutures?difficulte=${bouture.difficulte}`}
                                className="hover:text-primary transition-colors"
                            >
                                {DIFFICULTE_LABELS[bouture.difficulte] ??
                                    bouture.difficulte}
                            </Link>
                        )}
                    </nav>

                    {/* Titre */}
                    <div className="space-y-2">
                        <h1 className="font-serif text-4xl font-bold text-foreground leading-tight tracking-tight">
                            {bouture.nom}
                        </h1>
                        <p className="text-lg text-muted italic">
                            {bouture.espece}
                        </p>
                        {noteMoyenne && (
                            <div className="flex items-center gap-2 pt-1">
                                <Stars note={noteMoyenne} />
                                <span className="text-xs text-muted">
                                    {noteMoyenne.toFixed(1)} / 5
                                </span>
                            </div>
                        )}
                        {bouture.choixLibrairie && (
                            <span className="inline-block bg-background border border-border px-2 py-1 text-[7px] font-medium uppercase tracking-[0.12em] text-primary leading-tight mt-1">
                                Choix de la librairie
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {bouture.description && (
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Description
                            </h2>
                            <p className="text-base text-foreground leading-relaxed max-w-[68ch]">
                                {bouture.description}
                            </p>
                        </div>
                    )}

                    {/* Entretien */}
                    {bouture.conseilsEntretien && (
                        <div className="space-y-2">
                            <h2 className="text-xs uppercase tracking-widest text-muted">
                                Entretien
                            </h2>
                            <p className="text-base text-foreground leading-relaxed max-w-[68ch]">
                                {bouture.conseilsEntretien}
                            </p>
                        </div>
                    )}

                    {bouture.noteDeLaLibrairie && (
                        <NoteLibrairie note={bouture.noteDeLaLibrairie} />
                    )}

                    <AvisSection
                        avis={avis}
                        itemId={bouture.id}
                        type="bouture"
                    />
                </div>
            </div>
        </div>
    );
}
