export function uriToSlug(uri: string): string {
    if (uri.startsWith('isbn:')) return uri.slice(5).replace(/[-\s]/g, '');
    // wd:Q43361 → wd-Q43361 | inv:abc → inv-abc
    return uri.replace(':', '-');
}

export function slugToUri(slug: string): string {
    if (/^\d{10,13}$/.test(slug)) return `isbn:${slug}`;
    const dash = slug.indexOf('-');
    if (dash > 0) {
        const prefix = slug.slice(0, dash);
        if (prefix === 'wd' || prefix === 'inv' || prefix === 'gbid') {
            return `${prefix}:${slug.slice(dash + 1)}`;
        }
    }
    return slug;
}

export function uriToISBN(uri: string): string | null {
    if (uri.startsWith('isbn:')) return uri.slice(5).replace(/[-\s]/g, '');
    return null;
}
