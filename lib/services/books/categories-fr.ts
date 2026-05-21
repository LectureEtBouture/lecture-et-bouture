// Mapping statique BISAC → français. Ne change pas — pas besoin de trad dynamique.

const MAP: Record<string, string> = {
    // Fiction
    Fiction: 'Fiction',
    'Fiction / Action & Adventure': 'Fiction / Action & Aventure',
    'Fiction / Fantasy': 'Fantasy',
    'Fiction / Fantasy / General': 'Fantasy',
    'Fiction / Fantasy / Epic': 'Fantasy épique',
    'Fiction / Fantasy / Contemporary': 'Fantasy contemporain',
    'Fiction / Fantasy / Dark': 'Dark Fantasy',
    'Fiction / Horror': 'Horreur',
    'Fiction / Science Fiction': 'Science-fiction',
    'Fiction / Science Fiction / General': 'Science-fiction',
    'Fiction / Science Fiction / Space Opera': 'Science-fiction / Space opera',
    'Fiction / Thrillers': 'Thriller',
    'Fiction / Thrillers / General': 'Thriller',
    'Fiction / Thrillers / Crime': 'Thriller / Crime',
    'Fiction / Thrillers / Suspense': 'Thriller / Suspense',
    'Fiction / Mystery & Detective': 'Policier',
    'Fiction / Mystery & Detective / General': 'Policier',
    'Fiction / Crime': 'Policier',
    'Fiction / Romance': 'Romance',
    'Fiction / Romance / General': 'Romance',
    'Fiction / Historical / General': 'Fiction historique',
    'Fiction / Literary': 'Littérature générale',
    'Fiction / Short Stories (single author)': 'Nouvelles',
    'Fiction / Psychological': 'Thriller psychologique',
    // Jeunesse
    'Young Adult Fiction': 'Jeunesse / Ado',
    'Young Adult Fiction / Fantasy / General': 'Fantasy jeunesse',
    'Young Adult Fiction / Science Fiction / General':
        'Science-fiction jeunesse',
    'Young Adult Fiction / Romance / General': 'Romance jeunesse',
    'Young Adult Nonfiction': 'Documentaire ado',
    'Juvenile Fiction': 'Jeunesse',
    'Juvenile Nonfiction': 'Documentaire jeunesse',
    // BD / Manga
    'Comics & Graphic Novels': 'Bande dessinée',
    'Comics & Graphic Novels / General': 'Bande dessinée',
    'Comics & Graphic Novels / Manga / General': 'Manga',
    'Comics & Graphic Novels / Manga / Action & Adventure': 'Manga / Action',
    'Comics & Graphic Novels / Manga / Romance': 'Manga / Romance',
    'Comics & Graphic Novels / Manga / Fantasy': 'Manga / Fantasy',
    // Non-fiction
    'Biography & Autobiography': 'Biographie & mémoires',
    'Biography & Autobiography / General': 'Biographie & mémoires',
    'Biography & Autobiography / Literary': 'Biographie littéraire',
    History: 'Histoire',
    'History / General': 'Histoire',
    'History / Europe / France': 'Histoire / France',
    Philosophy: 'Philosophie',
    Science: 'Sciences',
    Nature: 'Nature',
    Animals: 'Animaux',
    Mythology: 'Mythologie',
    Folklore: 'Folklores & légendes',
    'Technology & Engineering': 'Technologie',
    Travel: 'Voyages',
    'Self-Help': 'Développement personnel',
    'Self-Help / General': 'Développement personnel',
    Psychology: 'Psychologie',
    'Political Science': 'Sciences politiques',
    'Social Science': 'Sciences sociales',
    Religion: 'Religion',
    Cooking: 'Cuisine',
    'Cooking / General': 'Cuisine',
    Art: 'Art',
    'Art / General': 'Art',
    Photography: 'Photographie',
    Music: 'Musique',
    'Performing Arts': 'Arts du spectacle',
    Poetry: 'Poésie',
    Drama: 'Théâtre',
    'Literary Criticism': 'Critique littéraire',
    'Language Arts & Disciplines': 'Langue & lettres',
    'Business & Economics': 'Économie & business',
    'True Crime': 'Faits divers',
    'Health & Fitness': 'Santé & bien-être',
    Gardening: 'Jardinage',
    'Crafts & Hobbies': 'Loisirs créatifs',
    'Sports & Recreation': 'Sport',
    Mathematics: 'Mathématiques',
    Medical: 'Médecine',
    Humor: 'Humour',
    'Games & Activities': 'Jeux & activités',
    'Body, Mind & Spirit': 'Bien-être',
    'Family & Relationships': 'Famille & relations',
    'Antiques & Collectibles': 'Antiquités & collections',
    Architecture: 'Architecture',
    'Comics & Graphic Novels / Fantasy': 'BD / Fantasy',
    'Marvelous, The': 'Merveilleux',
    Supernatural: 'Surnaturel',
    Paranormal: 'Paranormal',
    'Occult & Supernatural': 'Occulte & Surnaturel',
    Magic: 'Magie',
    'Fairy Tales, Folk Tales, Legends & Mythology': 'Contes & mythes',
};

export function translateCategory(cat: string): string {
    if (MAP[cat]) return MAP[cat];
    const first = cat.split(' / ')[0];
    return MAP[first] ?? cat;
}

export function translateCategories(categories: string[]): string[] {
    return categories.map(translateCategory);
}

// Noms affichables par slug — utilisé dans le BO (hint suggestion) et le front (CategorieFilter)
export const RAYON_SLUG_FR: Record<string, string> = {
    'sciences-nature': 'Sciences & Nature',
    litterature: 'Littérature',
    'philosophie-essai': 'Philosophie & Essai',
    histoire: 'Histoire',
    imaginaire: 'Imaginaire',
    'bande-dessinee': 'Bande dessinée',
    manga: 'Manga',
    jeunesse: 'Jeunesse',
    'policier-thriller': 'Policier / Thriller',
    biographie: 'Biographie',
    'art-beaux-livres': 'Art & Beaux livres',
    'cuisine-gastronomie': 'Cuisine & Gastronomie',
    voyage: 'Voyage',
    'developpement-personnel': 'Développement personnel',
    'poesie-theatre': 'Poésie & Théâtre',
};

// Mots-clés de fallback pour matcher par nom de rayon si le slug exact est absent
const RAYON_SLUG_KEYWORDS: Record<string, string[]> = {
    'sciences-nature': [
        'science',
        'nature',
        'animal',
        'botani',
        'écol',
        'jardinage',
        'naturel',
    ],
    litterature: ['littérat', 'roman', 'fiction', 'novel'],
    'philosophie-essai': ['philo', 'essai', 'social', 'politi'],
    histoire: ['histoir'],
    imaginaire: [
        'imaginaire',
        'fantast',
        'fantasy',
        'sf ',
        'sci-fi',
        'mythe',
        'mythol',
        'légende',
    ],
    'bande-dessinee': ['bande dessinée', 'bd', 'comic', 'graphic'],
    manga: ['manga'],
    jeunesse: ['jeune', 'enfant', 'junior', 'kids'],
    'policier-thriller': [
        'policier',
        'polar',
        'thriller',
        'crime',
        'mystère',
        'suspense',
    ],
    biographie: ['biograph', 'mémoir', 'autobiograph'],
    'art-beaux-livres': ['art', 'beaux', 'photo'],
    'cuisine-gastronomie': ['cuisin', 'gastronom', 'recett'],
    voyage: ['voyage', 'travel'],
    'developpement-personnel': ['développement', 'perso', 'bien-être'],
    'poesie-theatre': ['poési', 'théâtre', 'poème', 'dram'],
};

export function suggestRayonSlug(categories: string[]): string | null {
    for (const cat of categories) {
        const lower = cat.toLowerCase();
        if (lower.includes('manga')) return 'manga';
        if (lower.includes('comic') || lower.includes('graphic novel'))
            return 'bande-dessinee';
        if (lower.startsWith('juvenile')) return 'jeunesse';
        if (lower.includes('young adult')) {
            if (
                lower.includes('fantasy') ||
                lower.includes('science fiction') ||
                lower.includes('horror') ||
                lower.includes('paranormal')
            )
                return 'imaginaire';
            return 'jeunesse';
        }
        if (
            lower.includes('fantasy') ||
            lower.includes('science fiction') ||
            lower.includes('horror') ||
            lower.includes('myth') ||
            lower.includes('legend') ||
            lower.includes('folklor') ||
            lower.includes('marvelous') ||
            lower.includes('merveilleux') ||
            lower.includes('supernatural') ||
            lower.includes('paranormal') ||
            lower.includes('occult') ||
            lower.includes('magic') ||
            lower.includes('fairy') ||
            lower.includes('dragon') ||
            lower.includes('vampire') ||
            lower.includes('sorcier')
        )
            return 'imaginaire';
        if (
            lower.includes('thriller') ||
            lower.includes('crime') ||
            lower.includes('mystery') ||
            lower.includes('detective') ||
            lower.includes('true crime')
        )
            return 'policier-thriller';
        if (
            lower.includes('biography') ||
            lower.includes('autobiography') ||
            lower.includes('memoir')
        )
            return 'biographie';
        if (lower.startsWith('history') || lower === 'history')
            return 'histoire';
        if (
            lower.includes('philosophy') ||
            lower.includes('essay') ||
            lower.includes('political science') ||
            lower.includes('social science')
        )
            return 'philosophie-essai';
        if (
            lower.includes('poetry') ||
            lower.startsWith('drama') ||
            lower.includes('theater')
        )
            return 'poesie-theatre';
        if (
            lower.includes('cooking') ||
            lower.includes('gastronomy') ||
            lower.includes('culinary')
        )
            return 'cuisine-gastronomie';
        if (lower.startsWith('travel')) return 'voyage';
        if (
            lower.includes('self-help') ||
            lower.includes('personal development') ||
            lower.includes('body, mind')
        )
            return 'developpement-personnel';
        if (
            lower.startsWith('art') ||
            lower.startsWith('photography') ||
            lower.startsWith('architecture')
        )
            return 'art-beaux-livres';
        if (
            lower.includes('animal') ||
            lower.includes('nature') ||
            lower.includes('gardening') ||
            lower.includes('ecology') ||
            lower.includes('botany') ||
            lower.startsWith('science')
        )
            return 'sciences-nature';
        if (
            lower.startsWith('fiction') ||
            lower.includes('literary') ||
            lower.includes('literature')
        )
            return 'litterature';
    }
    return null;
}

// Match catégories BISAC traduits aux genres DB par correspondance de nom.
export function suggestGenreIds(
    categories: string[],
    genresList: { id: string; nom: string }[],
): string[] {
    const translated = categories.map(translateCategory);
    const ids = new Set<string>();
    for (const cat of translated) {
        const catLower = cat.toLowerCase();
        for (const genre of genresList) {
            const genreLower = genre.nom.toLowerCase();
            if (
                catLower.includes(genreLower) ||
                genreLower.includes(catLower)
            ) {
                ids.add(genre.id);
            }
        }
    }
    return [...ids];
}

// Cherche le rayon dans la liste DB — slug exact puis fuzzy sur nom.
// Retourne toujours un label à afficher, même si aucun rayon ne correspond (id = null).
export function suggestRayonFromList(
    categories: string[],
    rayonsList: { id: string; nom: string; slug: string }[],
): { id: string | null; label: string } | null {
    const slug = suggestRayonSlug(categories);
    if (!slug) return null;

    const bySlug = rayonsList.find((r) => r.slug === slug);
    if (bySlug) return { id: bySlug.id, label: bySlug.nom };

    const keywords = RAYON_SLUG_KEYWORDS[slug] ?? [slug.replace(/-/g, ' ')];
    const byName = rayonsList.find((r) =>
        keywords.some((k) => r.nom.toLowerCase().includes(k)),
    );
    if (byName) return { id: byName.id, label: byName.nom };

    return { id: null, label: RAYON_SLUG_FR[slug] ?? slug };
}
