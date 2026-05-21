import Link from 'next/link';
import {
    getAvis,
    validerAvis,
    masquerAvis,
    remettreEnLigneAvis,
    deleteAvis,
    type AvisSort,
} from '@/lib/actions/avis';
import { bookProvider } from '@/lib/services/books';
import { AvisSection } from './_components/AvisSection';
import { AvisRow, type BookMeta } from './_components/AvisRow';
import { ActionBtn } from './_components/ActionBtn';

const SORT_OPTIONS: { value: AvisSort; label: string }[] = [
    { value: 'date-desc', label: 'Plus récents' },
    { value: 'date-asc', label: 'Plus anciens' },
    { value: 'note-desc', label: 'Meilleure note' },
    { value: 'note-asc', label: 'Note croissante' },
    { value: 'type', label: 'Type' },
];

export default async function AdminAvisPage({
    searchParams,
}: {
    searchParams: Promise<{ sort?: string }>;
}) {
    const { sort: sortParam } = await searchParams;
    const sort = (
        SORT_OPTIONS.map((option) => option.value) as string[]
    ).includes(sortParam ?? '')
        ? (sortParam as AvisSort)
        : 'date-desc';

    const data = await getAvis(sort);

    const livreUris = [...new Set(
        data.filter((a) => a.type === 'livre' && a.inventaireUri).map((a) => a.inventaireUri!)
    )];
    const bookMetaMap = livreUris.length > 0
        ? await bookProvider.rechercherParUris(livreUris)
        : new Map<string, BookMeta>();

    const enAttente = data.filter((a) => !a.approuve && !a.masque);
    const visibles = data.filter((a) => a.approuve && !a.masque);
    const masques = data.filter((a) => a.masque);

    return (
        <div className="space-y-10">
            <div className="space-y-4">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Avis
                </h1>
                <div className="flex items-center gap-2 flex-wrap">
                    {SORT_OPTIONS.map((option) => (
                        <Link
                            key={option.value}
                            href={`/admin/avis?sort=${option.value}`}
                            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border transition-colors ${sort === option.value ? 'bg-primary border-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`}
                        >
                            {option.label}
                        </Link>
                    ))}
                </div>
            </div>

            <AvisSection
                titre={`En attente${enAttente.length > 0 ? ` (${enAttente.length})` : ''}`}
                vide="Aucun avis en attente."
            >
                {enAttente.map((a) => (
                    <AvisRow key={a.id} avis={a} bookMeta={a.inventaireUri ? bookMetaMap.get(a.inventaireUri) : undefined}>
                        <ActionBtn
                            action={async () => {
                                'use server';
                                await validerAvis(a.id);
                            }}
                            label="Valider"
                            variant="primary"
                        />
                        <ActionBtn
                            action={async () => {
                                'use server';
                                await deleteAvis(a.id);
                            }}
                            label="Supprimer"
                            variant="danger"
                        />
                    </AvisRow>
                ))}
            </AvisSection>

            <AvisSection
                titre={`Visibles${visibles.length > 0 ? ` (${visibles.length})` : ''}`}
                vide="Aucun avis publié."
            >
                {visibles.map((a) => (
                    <AvisRow key={a.id} avis={a} bookMeta={a.inventaireUri ? bookMetaMap.get(a.inventaireUri) : undefined}>
                        <ActionBtn
                            action={async () => {
                                'use server';
                                await masquerAvis(a.id);
                            }}
                            label="Visible"
                            variant="toggle-on"
                        />
                        <ActionBtn
                            action={async () => {
                                'use server';
                                await deleteAvis(a.id);
                            }}
                            label="Supprimer"
                            variant="danger"
                        />
                    </AvisRow>
                ))}
            </AvisSection>

            <AvisSection
                titre={`Masqués${masques.length > 0 ? ` (${masques.length})` : ''}`}
                vide="Aucun avis masqué."
            >
                {masques.map((a) => (
                    <AvisRow key={a.id} avis={a} bookMeta={a.inventaireUri ? bookMetaMap.get(a.inventaireUri) : undefined}>
                        <ActionBtn
                            action={async () => {
                                'use server';
                                await remettreEnLigneAvis(a.id);
                            }}
                            label="Masqué"
                            variant="toggle-off"
                        />
                        <ActionBtn
                            action={async () => {
                                'use server';
                                await deleteAvis(a.id);
                            }}
                            label="Supprimer"
                            variant="danger"
                        />
                    </AvisRow>
                ))}
            </AvisSection>
        </div>
    );
}
