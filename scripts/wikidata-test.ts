import { config } from 'dotenv';

config({ path: '.env.local' });

import { rechercherParISBN } from '../lib/services/wikidata';

const isbn = process.argv[2];

if (!isbn) {
    console.error('Usage: npx tsx scripts/wikidata-test.ts <isbn>');
    process.exit(1);
}

console.log(`Recherche ISBN : ${isbn} …`);

rechercherParISBN(isbn)
    .then((result) => {
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
