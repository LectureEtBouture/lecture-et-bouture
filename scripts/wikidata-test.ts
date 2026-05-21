import { config } from 'dotenv';

config({ path: '.env.local' });

import { WikidataProvider } from '../lib/services/books/providers/wikidata';

const isbn = process.argv[2];

if (!isbn) {
    console.error('Usage: npx tsx scripts/wikidata-test.ts <isbn>');
    process.exit(1);
}

console.log(`Recherche ISBN : ${isbn} …`);

const provider = new WikidataProvider();
provider
    .rechercherParISBN(isbn)
    .then((result: unknown) => {
        if (!result) {
            console.log('ISBN non trouvé dans Wikidata.');
        } else {
            console.log(JSON.stringify(result, null, 2));
        }
        process.exit(0);
    })
    .catch((err: Error) => {
        console.error('Erreur :', err.message);
        process.exit(1);
    });
