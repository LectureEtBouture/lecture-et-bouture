import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
import { pagesEditoriales, parametres } from './schema';

config({ path: '.env.local' });

const client = postgres(process.env['DATABASE_URL'] as string);
const db = drizzle(client);

async function main() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('db:seed interdit en production');
    }

    await db.execute(sql`TRUNCATE TABLE pages_editoriales`);
    await db.execute(sql`TRUNCATE TABLE parametres`);

    // Pages éditoriales
    const conceptContenu =
        '<h2>Une librairie qui ne ressemble pas à une librairie</h2>' +
        "<p>Lecture &amp; Bouture est née d'une conviction simple : les livres et les plantes partagent la même exigence. Ils demandent du temps, de l'attention, un espace pour exister. Ils ne s'imposent pas — ils s'offrent à qui prend la peine de les choisir.</p>" +
        "<p>Notre boutique réunit ces deux mondes sous le même toit. Côté livres, une sélection soignée de titres académiques, de littérature de fond et d'essais qui méritent d'être lus lentement. Côté boutures, des spécimens rares choisis pour leur caractère, accompagnés de conseils d'entretien fiables.</p>" +
        '<h2>Le rôle de la libraire</h2>' +
        '<p>Chaque titre présent dans notre catalogue a été lu, tenu en mains, discuté. Notre équipe ne référence pas : elle sélectionne. Cette différence est notre engagement principal.</p>' +
        "<p>La « Sélection de la libraire » regroupe ce que nous aimons vraiment — des livres pour lesquels nous pouvons répondre en personne. Elle évolue selon les saisons, les lectures, les découvertes. Pas d'algorithme, pas de bestseller par défaut.</p>" +
        '<h2>La lenteur comme parti pris</h2>' +
        "<p>Nous avons conçu ce site pour qu'il ne ressemble pas à une boutique en ligne. Pas de compteurs, pas de promotions, pas d'urgence. Le visiteur qui s'attarde, qui revient, qui prend le temps de lire la fiche d'un livre avant de l'acheter — c'est lui que nous cherchons à accueillir.</p>" +
        "<p>L'achat se fait chez leslibraires.fr, plateforme qui soutient les librairies indépendantes. Nous ne gérons pas de stock en ligne, pas de panier, pas de paiement direct. Ce que nous gérons, c'est le choix.</p>";

    const pagesInitiales = [
        { slug: 'concept', titre: 'Notre concept', contenu: conceptContenu },
        { slug: 'mentions-legales', titre: 'Mentions légales', contenu: null },
        { slug: 'cgv', titre: 'Conditions Générales de Vente', contenu: null },
        {
            slug: 'cgu',
            titre: "Conditions Générales d'Utilisation",
            contenu: null,
        },
        { slug: 'cookies', titre: 'Politique de cookies', contenu: null },
        {
            slug: 'politique-de-confidentialite',
            titre: 'Politique de confidentialité',
            contenu: null,
        },
    ];
    for (const page of pagesInitiales) {
        await db.insert(pagesEditoriales).values(page);
    }
    console.log(`Pages éditoriales : ${pagesInitiales.length}`);

    // Paramètres par défaut
    const parametresInitiaux = [
        {
            cle: 'horaires',
            valeur: JSON.stringify({
                lun: null,
                mar: { open: '10:00', close: '19:00' },
                mer: { open: '10:00', close: '19:00' },
                jeu: { open: '10:00', close: '19:00' },
                ven: { open: '10:00', close: '19:00' },
                sam: { open: '10:00', close: '19:00' },
                dim: null,
            }),
        },
        { cle: 'fermetures', valeur: JSON.stringify([]) },
        {
            cle: 'annonce',
            valeur: JSON.stringify({
                active: false,
                type: 'info',
                message: '',
                expire_at: null,
            }),
        },
        {
            cle: 'maintenance',
            valeur: JSON.stringify({
                active: false,
                message: 'Site en maintenance. Revenez bientôt.',
            }),
        },
        { cle: 'reseaux_sociaux', valeur: JSON.stringify([]) },
    ];
    for (const p of parametresInitiaux) {
        await db.insert(parametres).values(p);
    }
    console.log(`Paramètres : ${parametresInitiaux.length}`);

    await client.end();
    console.log('Seed terminé.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
