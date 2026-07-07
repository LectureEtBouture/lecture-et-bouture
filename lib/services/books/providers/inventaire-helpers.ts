export const BASE_URL = 'https://inventaire.io';
export const OL_BASE = 'https://openlibrary.org';
export const LANG_FR = 'wd:Q150';
export const USER_AGENT = 'LectureEtBouture/1.0 (contact@lecture-et-bouture.fr)';

export type InventaireEntity = {
    uri: string;
    type: string;
    labels: Record<string, string>;
    descriptions?: Record<string, string>;
    claims: Record<string, string[]>;
    image?: { url: string };
    originalLang?: string;
};

export type InventaireResponse = {
    entities: Record<string, InventaireEntity>;
    redirects?: Record<string, string>;
};

export function normaliserISBN(isbn: string): string {
    return isbn.replace(/[-\s]/g, '');
}

export function labelFr(entity: InventaireEntity | undefined): string | null {
    if (!entity) return null;
    return entity.labels?.fr ?? entity.labels?.en ?? null;
}

export function extractYear(dateStr: string | undefined): number | null {
    if (!dateStr) return null;
    const year = parseInt(dateStr.slice(0, 4), 10);
    return isNaN(year) ? null : year;
}

export function langCode(wikidataLangUri: string): string {
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

export function resolveRedirect(
    entities: Record<string, InventaireEntity>,
    redirects: Record<string, string>,
    uri: string,
): InventaireEntity | null {
    const resolved = redirects[uri] ?? uri;
    return entities[resolved] ?? null;
}

export async function fetchInvEntities(
    uris: string[],
): Promise<Record<string, InventaireEntity>> {
    const url = `${BASE_URL}/api/entities/by-uris?uris=${uris.join('|')}`;
    try {
        const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
        if (!res.ok) {
            console.warn(`Inventaire ${res.status} pour ${uris.length} URI(s)`);
            return {};
        }
        const data: InventaireResponse = await res.json();
        return data.entities ?? {};
    } catch (err) {
        console.warn('Inventaire injoignable :', err);
        return {};
    }
}

export async function fetchOLDescription(olId: string): Promise<string | null> {
    const res = await fetch(`${OL_BASE}/works/${olId}.json`, {
        headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const desc = data.description;
    if (!desc) return null;
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && desc.value) return desc.value as string;
    return null;
}

export async function fetchOLDescriptionByISBN(
    isbn: string,
): Promise<string | null> {
    const res = await fetch(
        `${OL_BASE}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
        {
            headers: { 'User-Agent': USER_AGENT },
            next: { revalidate: 86400 },
        } as RequestInit,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const book = data[`ISBN:${isbn}`];
    if (!book) return null;
    const notes = book.notes;
    if (notes) return typeof notes === 'string' ? notes : (notes.value ?? null);
    return null;
}
