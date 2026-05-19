import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
    // Block
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'pre',
    'hr',
    // Details / accordéon
    'details',
    'summary',
    'div',
    // Inline
    'a',
    'strong',
    'em',
    'u',
    's',
    'code',
    'span',
    'mark',
    'br',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
    // Block elements can have text-align
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    h4: ['style'],
    h5: ['style'],
    h6: ['style'],
    li: ['style'],
    blockquote: ['style'],
    div: ['style'],
    // Inline elements carry color / background-color / font-size
    span: ['style'],
    mark: ['style', 'data-color'],
    // Links
    a: ['href', 'target', 'rel'],
};

export function sanitizeRte(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
        allowedStyles: {
            '*': {
                color: [/.*/],
                'background-color': [/.*/],
                'font-size': [/.*/],
                'text-align': [/^(left|center|right|justify)$/],
            },
        },
        transformTags: {
            a(tagName, attribs) {
                if (attribs.target === '_blank') {
                    return {
                        tagName,
                        attribs: { ...attribs, rel: 'noopener noreferrer' },
                    };
                }
                return { tagName, attribs };
            },
        },
    });
}
