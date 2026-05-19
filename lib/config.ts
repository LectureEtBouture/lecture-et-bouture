export const storeConfig = {
    name: process.env.NEXT_PUBLIC_STORE_NAME ?? 'Lecture & Boutures',
    tagline:
        process.env.NEXT_PUBLIC_STORE_TAGLINE ??
        "Cultiver l'esprit, nourrir la terre.",
    description:
        process.env.NEXT_PUBLIC_STORE_DESCRIPTION ??
        'Livres soignés et boutures rares, curatés avec intention. Une librairie botanique.',
    url: process.env.NEXT_PUBLIC_STORE_URL ?? 'https://lectureetboutures.fr',
    locale: process.env.NEXT_PUBLIC_STORE_LOCALE ?? 'fr_FR',
    address: {
        street:
            process.env.NEXT_PUBLIC_STORE_ADDRESS_STREET ??
            '148 Rue de la Louvière',
        city: process.env.NEXT_PUBLIC_STORE_ADDRESS_CITY ?? '59800 Lille',
    },
    coords: {
        lat: parseFloat(
            process.env.NEXT_PUBLIC_STORE_LAT ?? '50.648010831232185',
        ),
        lng: parseFloat(
            process.env.NEXT_PUBLIC_STORE_LNG ?? '3.0860876551853957',
        ),
    },
};
