import type { BookProvider, LivreMetadata, LivreSearchResult } from '../types';
import {
    BASE_URL,
    LANG_FR,
    USER_AGENT,
    normaliserISBN,
    labelFr,
    extractYear,
    langCode,
    resolveRedirect,
    fetchInvEntities,
    fetchOLDescription,
    type InventaireEntity,
    type InventaireResponse,
} from './inventaire-helpers';

function entityToMeta(
    uri: string,
    entity: InventaireEntity,
): Partial<LivreMetadata> {
    const titre =
        entity.claims['wdt:P1476']?.[0] ??
        entity.labels?.fr ??
        entity.labels?.en ??
        null;
    const anneePublication = extractYear(entity.claims['wdt:P577']?.[0]);
    const imageUrl = entity.image?.url
        ? `${BASE_URL}${entity.image.url}`
        : null;
    const isbn =
        entity.claims['wdt:P212']?.[0] ??
        entity.claims['wdt:P957']?.[0] ??
        null;
    const description =
        entity.descriptions?.fr ?? entity.descriptions?.en ?? null;
    return {
        sourceId: uri,
        titre,
        anneePublication,
        imageUrl,
        isbn,
        description,
    };
}

export class InventaireProvider implements BookProvider {
    async rechercherParISBN(isbn: string): Promise<LivreMetadata | null> {
        const isbnUri = `isbn:${normaliserISBN(isbn)}`;

        const res1 = await fetch(
            `${BASE_URL}/api/entities/by-uris?uris=${isbnUri}`,
            { headers: { 'User-Agent': USER_AGENT } },
        );
        if (!res1.ok) throw new Error(`Inventaire ${res1.status}`);
        const data1: InventaireResponse = await res1.json();
        const edition = resolveRedirect(
            data1.entities,
            data1.redirects ?? {},
            isbnUri,
        );
        if (!edition) return null;

        const sourceId = edition.uri;
        const titre = edition.claims['wdt:P1476']?.[0] ?? null;
        const anneePublication = extractYear(edition.claims['wdt:P577']?.[0]);
        const imageUrl = edition.image?.url
            ? `${BASE_URL}${edition.image.url}`
            : null;

        const publisherUri = edition.claims['wdt:P123']?.[0] ?? null;
        const seriesUri = edition.claims['wdt:P179']?.[0] ?? null;
        const authorUri = edition.claims['wdt:P50']?.[0] ?? null;
        const workUri = edition.claims['wdt:P629']?.[0] ?? null;

        const toResolve = [publisherUri, seriesUri, authorUri, workUri].filter(
            (uri): uri is string => uri !== null,
        );

        if (toResolve.length === 0) {
            return {
                sourceId,
                titre,
                auteur: null,
                isbn: normaliserISBN(isbn),
                editeur: null,
                anneePublication,
                publishedDateRaw: null,
                serie: null,
                imageUrl,
                description: null,
                language: null,
            };
        }

        const resolved = await fetchInvEntities(toResolve);
        const editeur = labelFr(
            publisherUri ? resolved[publisherUri] : undefined,
        );
        const serie = labelFr(seriesUri ? resolved[seriesUri] : undefined);
        let auteur = labelFr(authorUri ? resolved[authorUri] : undefined);

        const work = workUri ? resolved[workUri] : null;
        const workLangUri = work?.claims['wdt:P407']?.[0] ?? null;
        const isFrench = workLangUri === LANG_FR;
        const olId = work?.claims['wdt:P648']?.[0] ?? null;
        const wdDescription =
            work?.descriptions?.fr ?? work?.descriptions?.en ?? null;

        if (!auteur && work) {
            const workAuthorUri = work.claims['wdt:P50']?.[0] ?? null;
            if (workAuthorUri) {
                const authorEntities = await fetchInvEntities([workAuthorUri]);
                auteur = labelFr(authorEntities[workAuthorUri]);
            }
        }

        let description: string | null = null;
        if (olId) {
            const raw = await fetchOLDescription(olId);
            if (raw) description = raw;
        }
        if (!description) description = wdDescription;

        return {
            sourceId,
            titre,
            auteur,
            isbn: normaliserISBN(isbn),
            editeur,
            anneePublication,
            publishedDateRaw: null,
            serie,
            imageUrl,
            description,
            language: null,
        };
    }

    async rechercherParUri(uri: string): Promise<LivreMetadata | null> {
        if (uri.startsWith('isbn:'))
            return this.rechercherParISBN(uri.slice(5));

        const entities = await fetchInvEntities([uri]);
        const entity = entities[uri];
        if (!entity) return null;

        const base = entityToMeta(uri, entity);
        const publisherUri = entity.claims['wdt:P123']?.[0] ?? null;
        const seriesUri = entity.claims['wdt:P179']?.[0] ?? null;
        const authorUri = entity.claims['wdt:P50']?.[0] ?? null;
        const olId = entity.claims['wdt:P648']?.[0] ?? null;
        const workLangUri = entity.claims['wdt:P407']?.[0] ?? null;
        const isFrench = workLangUri === LANG_FR;

        const toResolve = [publisherUri, seriesUri, authorUri].filter(
            (u): u is string => u !== null,
        );
        const resolved =
            toResolve.length > 0 ? await fetchInvEntities(toResolve) : {};

        const editeur = labelFr(
            publisherUri ? resolved[publisherUri] : undefined,
        );
        const serie = labelFr(seriesUri ? resolved[seriesUri] : undefined);
        const auteur = labelFr(authorUri ? resolved[authorUri] : undefined);

        let description = base.description ?? null;
        if (olId) {
            const raw = await fetchOLDescription(olId);
            if (raw) description = raw;
        }

        return {
            ...base,
            sourceId: uri,
            auteur,
            editeur,
            serie,
            description,
        } as LivreMetadata;
    }

    async rechercherParUris(
        uris: string[],
    ): Promise<Map<string, LivreMetadata>> {
        if (uris.length === 0) return new Map();

        // local: URIs n'existent pas sur inventaire.io — on les filtre
        const invUris = uris.filter((uri) => !uri.startsWith('local:'));
        if (invUris.length === 0) return new Map();

        const entities = await fetchInvEntities(invUris);

        const authorUriSet = new Set<string>();
        for (const entity of Object.values(entities)) {
            const authorUri = entity.claims['wdt:P50']?.[0];
            if (authorUri) authorUriSet.add(authorUri);
        }
        const authorEntities =
            authorUriSet.size > 0
                ? await fetchInvEntities([...authorUriSet])
                : {};

        const result = new Map<string, LivreMetadata>();
        for (const uri of uris) {
            const entity = entities[uri];
            if (!entity) continue;
            const base = entityToMeta(uri, entity);
            const authorUri = entity.claims['wdt:P50']?.[0] ?? null;
            const auteur = authorUri
                ? labelFr(authorEntities[authorUri])
                : null;
            result.set(uri, {
                ...base,
                sourceId: uri,
                auteur,
                editeur: null,
                serie: null,
            } as LivreMetadata);
        }
        return result;
    }

    async rechercherParTitre(query: string): Promise<LivreSearchResult[]> {
        const url = `${BASE_URL}/api/search?q=${encodeURIComponent(query)}&types=works&lang=fr&limit=8`;
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) return [];
        const data = await res.json();
        const results: {
            uri: string;
            label: string;
            description?: string;
            image?: { url: string };
        }[] = data.results ?? [];
        return results.map((item) => ({
            uri: item.uri,
            titre: item.label,
            description: item.description ?? null,
            imageUrl: item.image?.url ? `${BASE_URL}${item.image.url}` : null,
            auteur: null,
            isbn: null,
            editeur: null,
            anneePublication: null,
            categories: [],
            prixNumerique: null,
            isEbook: false,
        }));
    }
}
