'use client';

import { useState } from 'react';
import { TitreAuteurSearch } from '@/components/admin/TitreAuteurSearch';
import { inputClass, labelClass } from '@/components/admin/formStyles';
import {
    SelectionLivrePicker,
    type LivreEnrichi,
} from './SelectionLivrePicker';
import {
    SelectionArticlePicker,
    type ArticleEnrichi,
} from './SelectionArticlePicker';
import type { LivreMetadata } from '@/lib/services/books/types';

export function SelectionAddControls({
    livresEnrichis,
    plantesList,
    articlesList,
    onAddLivre,
    onAddPlante,
    onAddArticle,
}: {
    livresEnrichis: LivreEnrichi[];
    plantesList: { id: string; nom: string }[];
    articlesList: ArticleEnrichi[];
    onAddLivre: (meta: {
        uri: string;
        titre: string | null;
        imageUrl: string | null;
        auteur: string | null;
    }) => void;
    onAddPlante: (planteId: string, planteNom: string) => void;
    onAddArticle: (
        articleId: string,
        titre: string,
        imageUrl: string | null,
    ) => void;
}) {
    const [planteId, setPlanteId] = useState(plantesList[0]?.id ?? '');

    function handleImport(meta: LivreMetadata) {
        onAddLivre({
            uri: meta.sourceId,
            titre: meta.titre,
            imageUrl: meta.imageUrl,
            auteur: meta.auteur,
        });
    }

    return (
        <section className="space-y-6">
            <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted border-b border-border pb-2">
                Ajouter
            </h2>

            <div className="space-y-2 max-w-md">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground">
                    Livre
                </p>
                <p className="text-[11px] text-muted">
                    Recherche par titre ou auteur, ou choisissez parmi les
                    livres déjà enrichis.
                </p>
                <TitreAuteurSearch onImport={handleImport} />
                <SelectionLivrePicker
                    livres={livresEnrichis}
                    onPick={(livre) =>
                        onAddLivre({
                            uri: livre.inventaireUri,
                            titre: livre.titre,
                            imageUrl: livre.image,
                            auteur: null,
                        })
                    }
                />
            </div>

            <div className="space-y-3 pt-2 border-t border-border max-w-sm">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground pt-2">
                    Bouture
                </p>
                {plantesList.length === 0 ? (
                    <p className="text-[11px] text-muted">
                        Aucune bouture disponible.
                    </p>
                ) : (
                    <div className="flex items-end gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                            <label className={labelClass}>Spécimen</label>
                            <select
                                value={planteId}
                                onChange={(e) => setPlanteId(e.target.value)}
                                className={inputClass}
                            >
                                {plantesList.map((plante) => (
                                    <option key={plante.id} value={plante.id}>
                                        {plante.nom}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                const plante = plantesList.find(
                                    (p) => p.id === planteId,
                                );
                                if (plante) onAddPlante(plante.id, plante.nom);
                            }}
                            className="px-5 py-2 bg-primary text-background text-xs uppercase tracking-widest hover:bg-primary-light transition-colors shrink-0"
                        >
                            Ajouter
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-2 border-t border-border max-w-md">
                <p className="text-[11px] uppercase tracking-[0.08em] font-medium text-foreground pt-2">
                    Article de blog
                </p>
                <SelectionArticlePicker
                    articles={articlesList}
                    onPick={(article) =>
                        onAddArticle(article.id, article.titre, article.image)
                    }
                />
            </div>
        </section>
    );
}
