// Mapping rayons DB (slug) → termes de recherche Google Books
export const RAYON_TO_BISAC: Record<string, string> = {
    'sciences-nature': 'nature sciences écologie biologie',
    litterature: 'roman littérature fiction',
    'philosophie-essai': 'philosophie essai',
    histoire: 'histoire',
    imaginaire: 'fantasy fantastique "science fiction"',
    'bande-dessinee': '"bande dessinée" comics "graphic novel"',
    manga: 'manga',
    jeunesse: 'jeunesse enfants "young adult"',
    'policier-thriller': 'policier thriller crime mystère',
    biographie: 'biographie autobiographie mémoires',
    'art-beaux-livres': 'art photographie beaux-livres',
    'cuisine-gastronomie': 'cuisine gastronomie recettes',
    voyage: 'voyage',
    'developpement-personnel': '"développement personnel" coaching bien-être',
    'poesie-theatre': 'poésie théâtre',
};

export function bisacForRayon(rayonSlug: string): string | null {
    return RAYON_TO_BISAC[rayonSlug] ?? null;
}
