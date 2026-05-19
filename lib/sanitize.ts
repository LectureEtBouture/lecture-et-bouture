import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
    'p',
    'h2',
    'h3',
    'strong',
    'em',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'br',
    'hr',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
    a: ['href', 'target', 'rel'],
};

export function sanitizeRte(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
    });
}
