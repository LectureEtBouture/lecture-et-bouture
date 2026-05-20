import type { BookProvider, LivreMetadata } from '../types';

const BASE_URL = 'https://inventaire.io';

type InventaireEntity = {
    uri: string;
    type: string;
    labels: Record<string, string>;
    claims: Record<string, string[]>;
    image?: { url: string };
};

type InventaireResponse = {
    entities: Record<string, InventaireEntity>;
    redirects?: Record<string, string>;
};

function normaliserISBN(isbn: string): string {
    return isbn.replace(/[-\s]/g, '');
}

function labelFr(entity: InventaireEntity | undefined): string | null {
    if (!entity) return null;
    return entity.labels?.fr ?? entity.labels?.en ?? null;
}

function extractYear(dateStr: string | undefined): number | null {
    if (!dateStr) return null;
    const year = parseInt(dateStr.slice(0, 4), 10);
    return isNaN(year) ? null : year;
}

async function fetchEntities(
    uris: string[],
): Promise<Record<string, InventaireEntity>> {
    const url = `${BASE_URL}/api/entities/by-uris?uris=${uris.join('|')}`;
    const response = await fetch(url, {
        headers: { 'User-Agent': 'LectureEtBouture/1.0 (contact@lectureetboutures.fr)' },
    });
    if (!response.ok) {
        throw new Error(`Inventaire error: ${response.status} ${response.statusText}`);
    }
    const data: InventaireResponse = await response.json();
    return data.entities ?? {};
}

function resolveEntity(
    entities: Record<string, InventaireEntity>,
    redirects: Record<string, string>,
    uri: string,
): InventaireEntity | null {
    const resolvedUri = redirects[uri] ?? uri;
    return entities[resolvedUri] ?? null;
}

export class InventaireProvider implements BookProvider {
    async rechercherParISBN(isbn: string): Promise<LivreMetadata | null> {
        const clean = normaliserISBN(isbn);
        const isbnUri = `isbn:${clean}`;

        // Appel 1 : récupérer l'édition
        const step1 = await fetch(
            `${BASE_URL}/api/entities/by-uris?uris=${isbnUri}`,
            { headers: { 'User-Agent': 'LectureEtBouture/1.0 (contact@lectureetboutures.fr)' } },
        );
        if (!step1.ok) throw new Error(`Inventaire error: ${step1.status}`);

        const data1: InventaireResponse = await step1.json();
        const redirects1 = data1.redirects ?? {};
        const edition = resolveEntity(data1.entities, redirects1, isbnUri);
        if (!edition) return null;

        const sourceId = edition.uri;
        const titre = edition.claims['wdt:P1476']?.[0] ?? null;
        const anneePublication = extractYear(edition.claims['wdt:P577']?.[0]);
        const imageUrl = edition.image?.url
            ? `${BASE_URL}${edition.image.url}`
            : null;

        // URIs à résoudre (éditeur, série, auteur direct, œuvre)
        const publisherUri = edition.claims['wdt:P123']?.[0] ?? null;
        const seriesUri = edition.claims['wdt:P179']?.[0] ?? null;
        const authorUri = edition.claims['wdt:P50']?.[0] ?? null;
        const workUri = edition.claims['wdt:P629']?.[0] ?? null;

        const toResolve = [publisherUri, seriesUri, authorUri, workUri].filter(
            (uri): uri is string => uri !== null,
        );

        if (toResolve.length === 0) {
            return { sourceId, titre, auteur: null, editeur: null, anneePublication, serie: null, imageUrl };
        }

        // Appel 2 : résoudre éditeur, série, auteur, œuvre
        const resolved = await fetchEntities(toResolve);

        const editeur = labelFr(publisherUri ? resolved[publisherUri] : undefined);
        const serie = labelFr(seriesUri ? resolved[seriesUri] : undefined);
        let auteur = labelFr(authorUri ? resolved[authorUri] : undefined);

        // Auteur sur l'œuvre (P50) si pas sur l'édition
        if (!auteur && workUri) {
            const work = resolved[workUri];
            const workAuthorUri = work?.claims['wdt:P50']?.[0] ?? null;

            if (workAuthorUri) {
                // Appel 3 : résoudre l'auteur (conditionnel, uniquement si nécessaire)
                const authorEntities = await fetchEntities([workAuthorUri]);
                auteur = labelFr(authorEntities[workAuthorUri]);
            }
        }

        return { sourceId, titre, auteur, editeur, anneePublication, serie, imageUrl };
    }
}
