'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { InferSelectModel } from 'drizzle-orm';
import type { livres, genres, rayons } from '@/db/schema';
import type { LivreMetadata } from '@/lib/services/books/types';
import {
    translateCategories,
    suggestRayonFromList,
    suggestGenreIds,
} from '@/lib/services/books/categories-fr';
import { LivreFormIdentite } from './LivreFormIdentite';
import { LivreFormClassification } from './LivreFormClassification';
import { LivreFormCommerce } from './LivreFormCommerce';
import { LivreFormLibrairie } from './LivreFormLibrairie';
import { TitreAuteurSearch } from './TitreAuteurSearch';

type Livre = InferSelectModel<typeof livres>;
type Genre = InferSelectModel<typeof genres>;
type Rayon = InferSelectModel<typeof rayons>;

interface Props {
    action: (formData: FormData) => Promise<void>;
    livre?: Livre;
    selectedGenreIds?: string[];
    genresList: Genre[];
    rayonsList: Rayon[];
}

export function LivreForm({
    action,
    livre,
    selectedGenreIds = [],
    genresList,
    rayonsList,
}: Props) {
    const [sourceId, setSourceId] = useState(livre?.inventaireUri ?? '');
    const [titre, setTitre] = useState(livre?.titre ?? '');
    const [rayonId, setRayonId] = useState(livre?.rayonId ?? '');
    const [prixValue, setPrixValue] = useState(livre?.prix ?? '');
    const [suggestedCategories, setSuggestedCategories] = useState<string[]>(
        [],
    );
    const [suggestedRayonLabel, setSuggestedRayonLabel] = useState('');
    const [checkedGenreIds, setCheckedGenreIds] =
        useState<string[]>(selectedGenreIds);
    const [selectedBook, setSelectedBook] = useState<Pick<
        LivreMetadata,
        'titre' | 'auteur' | 'imageUrl'
    > | null>(null);

    function handleImport(data: LivreMetadata) {
        if (data.sourceId) setSourceId(data.sourceId);
        if (data.titre) setTitre(data.titre);
        setSelectedBook({
            titre: data.titre,
            auteur: data.auteur,
            imageUrl: data.imageUrl,
        });
        if (data.categories?.length) {
            setSuggestedCategories(translateCategories(data.categories));
            const suggestion = suggestRayonFromList(
                data.categories,
                rayonsList,
            );
            if (suggestion) {
                setSuggestedRayonLabel(suggestion.label);
                if (suggestion.id && !rayonId) setRayonId(suggestion.id);
            }
            const suggested = suggestGenreIds(data.categories, genresList);
            if (suggested.length > 0) {
                setCheckedGenreIds((prev) => [
                    ...new Set([...prev, ...suggested]),
                ]);
            }
        }
        if (data.prixNumerique && !prixValue) {
            setPrixValue(String(data.prixNumerique));
        }
    }

    function handleGenreChange(id: string, checked: boolean) {
        setCheckedGenreIds((prev) =>
            checked ? [...prev, id] : prev.filter((g) => g !== id),
        );
    }

    return (
        <form action={action} className="space-y-6 max-w-2xl">
            {!livre && <TitreAuteurSearch onImport={handleImport} />}
            {!livre && selectedBook && (
                <div className="flex items-center gap-3 p-3 border border-border bg-surface">
                    {selectedBook.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={selectedBook.imageUrl}
                            alt=""
                            className="w-10 h-14 object-cover shrink-0"
                        />
                    )}
                    <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                            {selectedBook.titre}
                        </p>
                        {selectedBook.auteur && (
                            <p className="text-[11px] text-muted">
                                {selectedBook.auteur}
                            </p>
                        )}
                    </div>
                </div>
            )}
            <LivreFormIdentite
                livre={livre}
                onImport={handleImport}
                inventaireUri={sourceId}
                onInventaireUriChange={setSourceId}
                titre={titre}
                onTitreChange={setTitre}
            />
            <LivreFormClassification
                checkedGenreIds={checkedGenreIds}
                onGenreChange={handleGenreChange}
                rayonIdValue={rayonId}
                onRayonChange={setRayonId}
                rayonsList={rayonsList}
                genresList={genresList}
                suggestedCategories={suggestedCategories}
                suggestedRayonLabel={suggestedRayonLabel}
            />
            <LivreFormCommerce
                prixValue={prixValue}
                onPrixChange={setPrixValue}
            />
            <LivreFormLibrairie livre={livre} />
            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Enregistrer
                </button>
                <Link
                    href="/admin/livres"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                >
                    Annuler
                </Link>
            </div>
        </form>
    );
}
