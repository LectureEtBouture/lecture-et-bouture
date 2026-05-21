import type { LivreMetadata } from '../types';

export type VolumeInfo = {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string; small?: string; medium?: string; large?: string; extraLarge?: string };
    language?: string;
    categories?: string[];
    previewLink?: string;
    pageCount?: number;
    printedPageCount?: number;
};

export type SaleInfo = {
    isEbook?: boolean;
    retailPrice?: { amount: number; currencyCode: string };
};

export type GoogleBooksVolume = {
    id: string;
    volumeInfo: VolumeInfo;
    saleInfo?: SaleInfo;
};

export type GoogleBooksResponse = {
    totalItems: number;
    items?: GoogleBooksVolume[];
};

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes';

export function buildUrl(params: Record<string, string>, langRestrict = true): string {
    const key = process.env.GOOGLE_BOOKS_API_KEY;
    const base: Record<string, string> = { hl: 'fr' };
    if (langRestrict) base.langRestrict = 'fr';
    const search = new URLSearchParams({ ...base, ...params });
    if (key) search.set('key', key);
    return `${GOOGLE_BOOKS_BASE}?${search.toString()}`;
}

export function isFrench(volume: GoogleBooksVolume): boolean {
    return volume.volumeInfo.language === 'fr';
}

export function volumeToMeta(volume: GoogleBooksVolume): LivreMetadata {
    const info = volume.volumeInfo;

    const identifiers = info.industryIdentifiers ?? [];
    const isbn13 = identifiers.find((id) => id.type === 'ISBN_13')?.identifier ?? null;
    const isbn10 = identifiers.find((id) => id.type === 'ISBN_10')?.identifier ?? null;
    const isbn = isbn13 ?? isbn10 ?? null;

    const rawThumb = info.imageLinks?.thumbnail ?? null;
    const imageUrl = rawThumb
        ? rawThumb
              .replace('http://', 'https://')
              .replace('zoom=1', 'zoom=0')
              .replace('&edge=curl', '')
        : isbn
          ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
          : null;

    const publishedDateRaw = info.publishedDate ?? null;
    const anneePublication = publishedDateRaw
        ? parseInt(publishedDateRaw.slice(0, 4), 10) || null
        : null;

    const sourceId = isbn ? `isbn:${isbn}` : `gbid:${volume.id}`;

    return {
        sourceId,
        titre: info.title ?? null,
        auteur: info.authors?.[0] ?? null,
        isbn,
        editeur: info.publisher ?? null,
        anneePublication,
        publishedDateRaw,
        serie: null,
        imageUrl,
        description: info.description ?? null,
        language: info.language ?? null,
        categories: info.categories ?? [],
        previewLink: info.previewLink ?? null,
        isEbook: volume.saleInfo?.isEbook ?? false,
        prixNumerique: volume.saleInfo?.retailPrice?.amount ?? null,
        nombrePages: info.printedPageCount ?? info.pageCount ?? null,
    };
}
