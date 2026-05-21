import { config } from 'dotenv';

config({ path: '.env.local' });

import { bookProvider } from '@/lib/services/books';

const isbn = process.argv[2];

if (!isbn) {
    console.error('Usage: npx tsx scripts/isbn-test.ts <isbn>');
    console.error(
        '       BOOK_PROVIDER=wikidata npx tsx scripts/isbn-test.ts <isbn>',
    );
    process.exit(1);
}

const provider = process.env.BOOK_PROVIDER ?? 'inventaire';
console.log(`Provider : ${provider}`);
console.log(`Recherche ISBN : ${isbn} …`);

bookProvider
    .rechercherParISBN(isbn)
    .then((result) => {
        if (!result) {
            console.log('ISBN non trouvé.');
        } else {
            console.log(JSON.stringify(result, null, 2));
        }
        process.exit(0);
    })
    .catch((err: Error) => {
        console.error('Erreur :', err.message);
        process.exit(1);
    });
