import livresData from '@/data/livres.json';
import bouturesData from '@/data/boutures.json';
import avisData from '@/data/avis.json';
import selectionsData from '@/data/selections.json';
import genresData from '@/data/genres.json';
import rayonsData from '@/data/rayons.json';

export type Livre = (typeof livresData)[number];
export type Bouture = (typeof bouturesData)[number];
export type Avis = (typeof avisData)[number];
export type Selection = (typeof selectionsData)[number];
export type Genre = (typeof genresData)[number];
export type Rayon = (typeof rayonsData)[number];

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

export type SortLivres =
    | 'alpha'
    | 'prix-asc'
    | 'prix-desc'
    | 'note'
    | 'date'
    | 'editeur'
    | 'edition';

export interface LivresFilters {
    genre?: number;
    rayon?: number;
    serie?: string;
    editeur?: string;
    format?: string;
    sort?: SortLivres;
    q?: string;
    choixLibrairie?: boolean;
}

// Livres

export function getLivres(filters: LivresFilters = {}): Livre[] {
    let result = [...livresData];

    if (filters.rayon)
        result = result.filter((livre) => livre.rayonId === filters.rayon);
    if (filters.genre)
        result = result.filter((livre) => livre.genreId === filters.genre);
    if (filters.serie)
        result = result.filter((livre) => livre.serie === filters.serie);
    if (filters.editeur)
        result = result.filter((livre) => livre.editeur === filters.editeur);
    if (filters.format)
        result = result.filter((livre) => livre.format === filters.format);
    if (filters.choixLibrairie)
        result = result.filter((livre) => livre.choixLibrairie);
    if (filters.q) {
        const q = filters.q.toLowerCase();
        result = result.filter(
            (livre) =>
                livre.titre.toLowerCase().includes(q) ||
                livre.auteur.toLowerCase().includes(q) ||
                (livre.collection ?? '').toLowerCase().includes(q) ||
                livre.editeur.toLowerCase().includes(q) ||
                (livre.serie ?? '').toLowerCase().includes(q),
        );
    }

    switch (filters.sort) {
        case 'alpha':
            result.sort((a, b) => a.titre.localeCompare(b.titre, 'fr'));
            break;
        case 'prix-asc':
            result.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
            break;
        case 'prix-desc':
            result.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix));
            break;
        case 'note':
            result.sort(
                (a, b) =>
                    parseFloat(b.noteMoyenne ?? '0') -
                    parseFloat(a.noteMoyenne ?? '0'),
            );
            break;
        case 'date':
            result.sort((a, b) =>
                (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''),
            );
            break;
        case 'editeur':
            result.sort((a, b) => a.editeur.localeCompare(b.editeur, 'fr'));
            break;
        default:
            result.sort((a, b) => {
                if (a.serie && b.serie && a.serie === b.serie) {
                    return (a.numeroSerie ?? 0) - (b.numeroSerie ?? 0);
                }
                return a.titre.localeCompare(b.titre, 'fr');
            });
    }

    return result;
}

export type LivresGroupe =
    | { type: 'serie'; serie: string; livres: Livre[] }
    | { type: 'standalone'; livres: Livre[] };

export function groupLivres(livres: Livre[]): LivresGroupe[] {
    const seriesMap = new Map<string, Livre[]>();
    const standalone: Livre[] = [];

    for (const livre of livres) {
        if (livre.serie) {
            const existing = seriesMap.get(livre.serie) ?? [];
            existing.push(livre);
            seriesMap.set(livre.serie, existing);
        } else {
            standalone.push(livre);
        }
    }

    const groups: LivresGroupe[] = [];
    for (const [serie, livresSerie] of seriesMap) {
        groups.push({ type: 'serie', serie, livres: livresSerie });
    }
    if (standalone.length > 0) {
        groups.push({ type: 'standalone', livres: standalone });
    }
    return groups;
}

export function getLivreBySlug(slug: string): Livre | undefined {
    return livresData.find((livre) => livre.slug === slug);
}

export function getLivresMisEnAvant(): Livre[] {
    return livresData.filter((livre) => livre.choixLibrairie);
}

export function getLivresSeries(): string[] {
    const series = new Set(
        livresData.map((livre) => livre.serie).filter(Boolean) as string[],
    );
    return Array.from(series).sort();
}

export function getLivresEditeurs(): string[] {
    const editeurs = new Set(livresData.map((livre) => livre.editeur));
    return Array.from(editeurs).sort();
}

export function getLivresFormats(): string[] {
    const formats = new Set(livresData.map((livre) => livre.format));
    return Array.from(formats).sort();
}

// Genres scoped to the selected rayon, or all books if no rayon
export function getGenresActifs(rayonId?: number): Genre[] {
    const scope = rayonId
        ? livresData.filter((livre) => livre.rayonId === rayonId)
        : livresData;
    const activeIds = new Set(
        scope
            .map((livre) => livre.genreId)
            .filter((id): id is number => id != null),
    );
    return genresData.filter((genre) => activeIds.has(genre.id));
}

export interface Recommendations {
    memeSerie: Livre[];
    memeGenre: Livre[];
    memeAuteur: Livre[];
}

export function getRecommendations(livre: Livre, limit = 4): Recommendations {
    const all = livresData.filter((other) => other.id !== livre.id);

    const memeSerie = livre.serie
        ? all
              .filter((other) => other.serie === livre.serie)
              .sort((a, b) => (a.numeroSerie ?? 0) - (b.numeroSerie ?? 0))
        : [];

    const serieIds = new Set(memeSerie.map((other) => other.id));

    const memeGenre = livre.genreId
        ? all
              .filter(
                  (other) =>
                      other.genreId === livre.genreId &&
                      !serieIds.has(other.id),
              )
              .sort(
                  (a, b) =>
                      parseFloat(b.noteMoyenne ?? '0') -
                      parseFloat(a.noteMoyenne ?? '0'),
              )
              .slice(0, limit)
        : [];

    const genreIds = new Set(memeGenre.map((other) => other.id));

    const memeAuteur = all
        .filter(
            (other) =>
                other.auteur === livre.auteur &&
                !serieIds.has(other.id) &&
                !genreIds.has(other.id),
        )
        .sort(
            (a, b) =>
                parseFloat(b.noteMoyenne ?? '0') -
                parseFloat(a.noteMoyenne ?? '0'),
        )
        .slice(0, limit);

    return { memeSerie, memeGenre, memeAuteur };
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

export type SortBoutures =
    | 'alpha'
    | 'prix-asc'
    | 'prix-desc'
    | 'note'
    | 'difficulte';

export interface BouturesFilters {
    difficulte?: string;
    lumiere?: string;
    arrosage?: string;
    sort?: SortBoutures;
    q?: string;
    choixLibrairie?: boolean;
}

// Boutures

export function getBoutures(filters: BouturesFilters = {}): Bouture[] {
    let result = [...bouturesData];

    if (filters.difficulte)
        result = result.filter(
            (bouture) => bouture.difficulte === filters.difficulte,
        );
    if (filters.lumiere)
        result = result.filter(
            (bouture) => bouture.lumiere === filters.lumiere,
        );
    if (filters.arrosage)
        result = result.filter(
            (bouture) => bouture.arrosage === filters.arrosage,
        );
    if (filters.choixLibrairie)
        result = result.filter((bouture) => bouture.choixLibrairie);
    if (filters.q) {
        const q = filters.q.toLowerCase();
        result = result.filter(
            (bouture) =>
                bouture.nom.toLowerCase().includes(q) ||
                bouture.espece.toLowerCase().includes(q) ||
                bouture.famille.toLowerCase().includes(q),
        );
    }

    const DIFFICULTE_ORDER: Record<string, number> = {
        facile: 0,
        moyen: 1,
        difficile: 2,
    };

    switch (filters.sort) {
        case 'alpha':
            result.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
            break;
        case 'prix-asc':
            result.sort((a, b) => parseFloat(a.prix) - parseFloat(b.prix));
            break;
        case 'prix-desc':
            result.sort((a, b) => parseFloat(b.prix) - parseFloat(a.prix));
            break;
        case 'note':
            result.sort(
                (a, b) =>
                    parseFloat(b.noteMoyenne ?? '0') -
                    parseFloat(a.noteMoyenne ?? '0'),
            );
            break;
        case 'difficulte':
            result.sort(
                (a, b) =>
                    (DIFFICULTE_ORDER[a.difficulte] ?? 0) -
                    (DIFFICULTE_ORDER[b.difficulte] ?? 0),
            );
            break;
        default:
            result.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    }

    return result;
}

export function getBoutureBySlug(slug: string): Bouture | undefined {
    return bouturesData.find((bouture) => bouture.slug === slug);
}

export function getBouturesMisEnAvant(): Bouture[] {
    return bouturesData.filter((bouture) => bouture.choixLibrairie);
}

// Avis

export function getAvisForLivre(livreId: number): Avis[] {
    return avisData.filter(
        (avis) =>
            avis.type === 'livre' && avis.livreId === livreId && avis.approuve,
    );
}

export function getAvisForBouture(boutureId: number): Avis[] {
    return avisData.filter(
        (avis) =>
            avis.type === 'plante' &&
            avis.planteId === boutureId &&
            avis.approuve,
    );
}

// Sélections

export function getSelectionsActives(): Selection[] {
    return selectionsData
        .filter((selection) => selection.active)
        .sort((a, b) => a.ordre - b.ordre);
}

export function getSelectionItems(selection: Selection) {
    return selection.items
        .map((item) => {
            if (item.type === 'livre') {
                return {
                    type: 'livre' as const,
                    data: livresData.find((livre) => livre.id === item.id),
                };
            }
            return {
                type: 'bouture' as const,
                data: bouturesData.find((bouture) => bouture.id === item.id),
            };
        })
        .filter((item) => item.data !== undefined);
}

// Genres

export function getGenres(): Genre[] {
    return genresData;
}

export function getGenreById(id: number): Genre | undefined {
    return genresData.find((genre) => genre.id === id);
}

// Rayons

export function getRayons(): Rayon[] {
    return rayonsData;
}

export function getRayonById(id: number): Rayon | undefined {
    return rayonsData.find((rayon) => rayon.id === id);
}

export function getLivresRayons(): Rayon[] {
    const activeIds = new Set(livresData.map((livre) => livre.rayonId));
    return rayonsData.filter((rayon) => activeIds.has(rayon.id));
}
