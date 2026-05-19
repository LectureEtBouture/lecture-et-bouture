// Livres — couleurs de couverture par genre

const GENRE_COLORS: Record<number, string> = {
    1: '#c2c8cc', // Philosophie — ardoise froide
    2: '#b8c9b0', // Botanique — sauge
    3: '#ccc5b0', // Essai — sable chaud
    4: '#c8bcb8', // Littérature — rose poussiéreuse
    5: '#afc8c3', // Sciences naturelles — sarcelle atténuée
    6: '#cdc3a4', // Histoire — or pâle
    7: '#b4bdc8', // LitRPG — ardoise bleue
    8: '#bfb4c8', // Fantasy — mauve atténué
};

export function getCoverColor(genreId: number | null | undefined): string {
    return GENRE_COLORS[genreId ?? 0] ?? '#e8e5dc';
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
