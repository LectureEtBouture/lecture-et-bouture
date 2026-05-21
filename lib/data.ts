// Livres — couleurs de couverture par genre (palette fixe, assignée par UUID hash)
const COVER_PALETTE = [
    '#c2c8cc',
    '#b8c9b0',
    '#ccc5b0',
    '#c8bcb8',
    '#afc8c3',
    '#cdc3a4',
    '#b4bdc8',
    '#bfb4c8',
];

export function getCoverColor(
    genreId: string | number | null | undefined,
): string {
    if (!genreId) return '#e8e5dc';
    // Déterministe : dernier chars du UUID → index dans palette
    const str = String(genreId);
    const hex = str.replace(/-/g, '').slice(-2);
    const index = parseInt(hex, 16) % COVER_PALETTE.length;
    return COVER_PALETTE[index] ?? '#e8e5dc';
}

// Boutures — couleurs de couverture par niveau de lumière

const LUMIERE_COLORS: Record<string, string> = {
    'plein-soleil': '#d4c9a8',
    'lumiere-vive': '#ccc3a0',
    'mi-ombre': '#b8c9b0',
    ombre: '#a4b89e',
};

export function getBoutureCoverColor(lumiere: string): string {
    return LUMIERE_COLORS[lumiere] ?? '#c8c9b8';
}

export const DIFFICULTE_LABELS: Record<string, string> = {
    facile: 'Facile',
    moyen: 'Intermédiaire',
    difficile: 'Exigeante',
};

export const LUMIERE_LABELS: Record<string, string> = {
    'plein-soleil': 'Plein soleil',
    'lumiere-vive': 'Lumière vive',
    'mi-ombre': 'Mi-ombre',
    ombre: 'Ombre',
};

export const ARROSAGE_LABELS: Record<string, string> = {
    regulier: 'Régulier',
    modere: 'Modéré',
    rare: 'Rare',
};
