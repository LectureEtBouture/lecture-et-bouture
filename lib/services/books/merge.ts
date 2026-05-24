import type { LivreMetadata, EnrichissementLocal, LivreComplet } from './types';
import { uriToSlug, uriToISBN } from './slug';

export function fusionner(
    meta: LivreMetadata,
    enrichissement: EnrichissementLocal | null,
): LivreComplet {
    const isbn = meta.isbn ?? uriToISBN(meta.sourceId);
    return {
        inventaireUri: meta.sourceId,
        slug: uriToSlug(meta.sourceId),
        titre: meta.titre ?? '',
        auteur: meta.auteur,
        isbn,
        editeur: meta.editeur,
        anneePublication: meta.anneePublication,
        publishedDateRaw: meta.publishedDateRaw ?? null,
        serie: meta.serie,
        imageUrl: enrichissement?.image ?? meta.imageUrl,
        imageAlt: enrichissement?.imageAlt ?? null,
        description: meta.description,
        descriptionAdmin: enrichissement?.description ?? null,
        language: meta.language ?? null,
        categories: meta.categories ?? [],
        previewLink: meta.previewLink ?? null,
        isEbook: meta.isEbook ?? false,
        prixNumerique: meta.prixNumerique ?? null,
        nombrePages: meta.nombrePages ?? null,
        localId: enrichissement?.localId ?? null,
        prix: enrichissement?.prix ?? null,
        choixLibrairie: enrichissement?.choixLibrairie ?? false,
        noteDeLaLibrairie: enrichissement?.noteDeLaLibrairie ?? null,
        rayonId: enrichissement?.rayonId ?? null,
        genreIds: enrichissement?.genreIds ?? [],
        numeroSerie: enrichissement?.numeroSerie ?? null,
        noteMoyenne: enrichissement?.noteMoyenne ?? null,
    };
}

export function fusionnerListe(
    metas: Map<string, LivreMetadata>,
    enrichissements: Map<string, EnrichissementLocal>,
    orderedUris: string[],
): LivreComplet[] {
    return orderedUris
        .map((uri) => {
            const meta = metas.get(uri);
            if (!meta) return null;
            return fusionner(meta, enrichissements.get(uri) ?? null);
        })
        .filter((livre): livre is LivreComplet => livre !== null);
}
