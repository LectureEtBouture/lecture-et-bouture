import type { BookProvider, LivreMetadata, LivreSearchResult } from '../types';
import {
    buildUrl,
    volumeToMeta,
    type GoogleBooksResponse,
} from './google-books-helpers';

// Google serves a ~9KB "image not available" PNG for books without scans
const COVER_MIN_BYTES = 10_000;

async function validateCoverUrl(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) return false;
        const len = res.headers.get('content-length');
        if (len && parseInt(len, 10) < COVER_MIN_BYTES) return false;
        return true;
    } catch {
        return true;
    }
}

export class GoogleBooksProvider implements BookProvider {
    async rechercherParISBN(isbn: string): Promise<LivreMetadata | null> {
        const clean = isbn.replace(/[-\s]/g, '');
        const url = buildUrl({ q: `isbn:${clean}`, maxResults: '1' });
        const res = await fetch(url, { next: { revalidate: 86400 } });
        if (!res.ok) return null;
        const data: GoogleBooksResponse = await res.json();
        const volume = data.items?.[0];
        if (!volume) return null;
        const meta = volumeToMeta(volume);
        if (meta.imageUrl) {
            const valid = await validateCoverUrl(meta.imageUrl);
            if (!valid) return { ...meta, imageUrl: null };
        }
        return meta;
    }

    async rechercherParUri(uri: string): Promise<LivreMetadata | null> {
        if (uri.startsWith('isbn:'))
            return this.rechercherParISBN(uri.slice(5));
        if (uri.startsWith('gbid:')) {
            const id = uri.slice(5);
            const key = process.env.GOOGLE_BOOKS_API_KEY;
            const url = `https://www.googleapis.com/books/v1/volumes/${id}?hl=fr${key ? `&key=${key}` : ''}`;
            const res = await fetch(url, { next: { revalidate: 86400 } });
            if (!res.ok) return null;
            const volume = await res.json();
            return volumeToMeta(volume);
        }
        return null;
    }

    async rechercherParUris(
        uris: string[],
    ): Promise<Map<string, LivreMetadata>> {
        if (uris.length === 0) return new Map();
        const entries = await Promise.all(
            uris.map(async (uri) => {
                const meta = await this.rechercherParUri(uri);
                return [uri, meta] as const;
            }),
        );
        const result = new Map<string, LivreMetadata>();
        for (const [uri, meta] of entries) {
            if (meta) result.set(uri, meta);
        }
        return result;
    }

    async rechercherParTitre(
        query: string,
        options?: {
            orderBy?: 'relevance' | 'newest';
            startIndex?: number;
            maxResults?: number;
        },
    ): Promise<LivreSearchResult[]> {
        const url = buildUrl({
            q: query,
            maxResults: String(options?.maxResults ?? 8),
            orderBy: options?.orderBy ?? 'relevance',
            startIndex: String(options?.startIndex ?? 0),
        });
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data: GoogleBooksResponse = await res.json();
        if (!data.items) return [];
        return data.items.map((volume) => {
            const meta = volumeToMeta(volume);
            return {
                uri: meta.sourceId,
                titre: meta.titre ?? volume.volumeInfo.title ?? '',
                description: meta.description,
                imageUrl: meta.imageUrl,
                auteur: meta.auteur,
                isbn: meta.isbn,
                editeur: meta.editeur,
                anneePublication: meta.anneePublication,
                categories: meta.categories ?? [],
                prixNumerique: meta.prixNumerique ?? null,
                isEbook: meta.isEbook ?? false,
            };
        });
    }

    async rechercherTendances(startIndex = 0): Promise<LivreMetadata[]> {
        const url = buildUrl(
            {
                q: 'roman',
                printType: 'books',
                orderBy: 'relevance',
                maxResults: '40',
                startIndex: String(startIndex),
            },
            false,
        );
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data: GoogleBooksResponse = await res.json();
        return (data.items ?? []).map(volumeToMeta);
    }

    async rechercherNouveautes(startIndex = 0): Promise<LivreMetadata[]> {
        const url = buildUrl(
            {
                q: 'roman',
                printType: 'books',
                orderBy: 'newest',
                maxResults: '40',
                startIndex: String(startIndex),
            },
            false,
        );
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data: GoogleBooksResponse = await res.json();
        return (data.items ?? []).map(volumeToMeta);
    }

    async rechercherParSujet(
        query: string,
        startIndex = 0,
    ): Promise<LivreMetadata[]> {
        const url = buildUrl(
            {
                q: query,
                printType: 'books',
                orderBy: 'relevance',
                maxResults: '40',
                startIndex: String(startIndex),
            },
            false,
        );
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data: GoogleBooksResponse = await res.json();
        return (data.items ?? []).map(volumeToMeta);
    }
}
