import type { BookProvider, LivreMetadata } from '../types';
import { traduire } from '@/lib/services/libretranslate';

const BASE_URL = 'https://inventaire.io';
const OL_BASE = 'https://openlibrary.org';
const LANG_FR = 'wd:Q150';

type InventaireEntity = {
    uri: string;
    type: string;
    labels: Record<string, string>;
    descriptions?: Record<string, string>;
    claims: Record<string, string[]>;
    image?: { url: string };
    originalLang?: string;
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

function langCode(wikidataLangUri: string): string {
    const map: Record<string, string> = {
        'wd:Q150': 'fr',
        'wd:Q1860': 'en',
        'wd:Q188': 'de',
        'wd:Q1321': 'es',
        'wd:Q652': 'it',
        'wd:Q5146': 'pt',
    };
    return map[wikidataLangUri] ?? 'en';
}

async function fetchInvEntities(
    uris: string[],
): Promise<Record<string, InventaireEntity>> {
    const url = `${BASE_URL}/api/entities/by-uris?uris=${uris.join('|')}`;
    const res = await fetch(url, {
        headers: { 'User-Agent': 'LectureEtBouture/1.0 (contact@lectureetboutures.fr)' },
    });
    if (!res.ok) throw new Error(`Inventaire ${res.status}`);
    const data: InventaireResponse = await res.json();
    return data.entities ?? {};
}

async function fetchOLDescription(olId: string): Promise<string | null> {
    const res = await fetch(`${OL_BASE}/works/${olId}.json`, {
        headers: { 'User-Agent': 'LectureEtBouture/1.0 (contact@lectureetboutures.fr)' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const desc = data.description;
    if (!desc) return null;
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && desc.value) return desc.value as string;
    return null;
}

function resolveRedirect(
    entities: Record<string, InventaireEntity>,
    redirects: Record<string, string>,
    uri: string,
): InventaireEntity | null {
    const resolved = redirects[uri] ?? uri;
    return entities[resolved] ?? null;
}

export class InventaireProvider implements BookProvider {
    async rechercherParISBN(isbn: string): Promise<LivreMetadata | null> {
        const isbnUri = `isbn:${normaliserISBN(isbn)}`;

        // Appel 1 : édition
        const res1 = await fetch(`${BASE_URL}/api/entities/by-uris?uris=${isbnUri}`, {
            headers: { 'User-Agent': 'LectureEtBouture/1.0 (contact@lectureetboutures.fr)' },
        });
        if (!res1.ok) throw new Error(`Inventaire ${res1.status}`);
        const data1: InventaireResponse = await res1.json();
        const edition = resolveRedirect(data1.entities, data1.redirects ?? {}, isbnUri);
        if (!edition) return null;

        const sourceId = edition.uri;
        const titre = edition.claims['wdt:P1476']?.[0] ?? null;
        const anneePublication = extractYear(edition.claims['wdt:P577']?.[0]);
        const imageUrl = edition.image?.url ? `${BASE_URL}${edition.image.url}` : null;

        const publisherUri = edition.claims['wdt:P123']?.[0] ?? null;
        const seriesUri = edition.claims['wdt:P179']?.[0] ?? null;
        const authorUri = edition.claims['wdt:P50']?.[0] ?? null;
        const workUri = edition.claims['wdt:P629']?.[0] ?? null;

        const toResolve = [publisherUri, seriesUri, authorUri, workUri].filter(
            (uri): uri is string => uri !== null,
        );

        if (toResolve.length === 0) {
            return { sourceId, titre, auteur: null, editeur: null, anneePublication, serie: null, imageUrl, description: null };
        }

        // Appel 2 : éditeur + série + auteur + œuvre
        const resolved = await fetchInvEntities(toResolve);

        const editeur = labelFr(publisherUri ? resolved[publisherUri] : undefined);
        const serie = labelFr(seriesUri ? resolved[seriesUri] : undefined);
        let auteur = labelFr(authorUri ? resolved[authorUri] : undefined);

        const work = workUri ? resolved[workUri] : null;
        const workLangUri = work?.claims['wdt:P407']?.[0] ?? null;
        const isFrench = workLangUri === LANG_FR;
        const olId = work?.claims['wdt:P648']?.[0] ?? null;
        const wdDescription = work?.descriptions?.fr ?? work?.descriptions?.en ?? null;

        // Appel 3 (conditionnel) : auteur depuis l'œuvre
        if (!auteur && work) {
            const workAuthorUri = work.claims['wdt:P50']?.[0] ?? null;
            if (workAuthorUri) {
                const authorEntities = await fetchInvEntities([workAuthorUri]);
                auteur = labelFr(authorEntities[workAuthorUri]);
            }
        }

        // Appel 4 (conditionnel) : description Open Library
        let description: string | null = null;
        if (olId) {
            const raw = await fetchOLDescription(olId);
            if (raw) {
                description = isFrench ? raw : await traduire(raw, langCode(workLangUri ?? ''), 'fr').catch(() => raw);
            }
        }
        // Fallback : description courte Wikidata
        if (!description) description = wdDescription;

        return { sourceId, titre, auteur, editeur, anneePublication, serie, imageUrl, description };
    }
}
