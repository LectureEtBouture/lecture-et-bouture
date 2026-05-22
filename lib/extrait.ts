import sanitizeHtml from 'sanitize-html';

export function extraireTexte(html: string, maxChars = 200): string {
    const texte = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
        .replace(/\s+/g, ' ')
        .trim();
    if (texte.length <= maxChars) return texte;
    const coupe = texte.lastIndexOf(' ', maxChars);
    return texte.slice(0, coupe > 0 ? coupe : maxChars) + '…';
}
