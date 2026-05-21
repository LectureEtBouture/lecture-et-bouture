import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
import { plantes, evenements, pagesEditoriales, parametres } from './schema';
import bouturesJson from '../data/boutures.json';
import avisJson from '../data/avis.json';

config({ path: '.env.local' });

type BoutureJson = {
    id: number;
    slug: string;
    nom: string;
    espece: string | null;
    famille: string | null;
    prix: string;
    description: string | null;
    conseilsEntretien: string | null;
    difficulte: 'facile' | 'moyen' | 'difficile' | null;
    lumiere: 'ombre' | 'mi-ombre' | 'lumiere-vive' | 'plein-soleil' | null;
    arrosage: 'rare' | 'modere' | 'regulier' | 'abondant' | null;
    images: string[];
    noteMoyenne: string | null;
    choixLibrairie: boolean;
    stock: number;
};

type AvisJson = {
    id: number;
    type: string;
    livreId: number | null;
    planteId: number | null;
    auteurNom: string;
    note: number;
    texte: string | null;
    approuve: boolean;
};

const client = postgres(process.env['DATABASE_URL'] as string);
const db = drizzle(client);

async function main() {
    await db.execute(
        sql`TRUNCATE TABLE avis, selection_items, evenements, livres_genres, livres, plantes, selections, genres, rayons CASCADE`,
    );
    await db.execute(sql`TRUNCATE TABLE pages_editoriales`);
    await db.execute(sql`TRUNCATE TABLE parametres`);

    // Boutures / plantes
    const planteIdMap = new Map<number, string>();
    const sortedBoutures = [...(bouturesJson as BoutureJson[])].sort(
        (a, b) => a.id - b.id,
    );
    for (const bouture of sortedBoutures) {
        const [row] = await db
            .insert(plantes)
            .values({
                slug: bouture.slug,
                nom: bouture.nom,
                espece: bouture.espece ?? null,
                famille: bouture.famille ?? null,
                prix: bouture.prix,
                description: bouture.description ?? null,
                conseilsEntretien: bouture.conseilsEntretien ?? null,
                difficulte: bouture.difficulte ?? null,
                lumiere: bouture.lumiere ?? null,
                arrosage: bouture.arrosage ?? null,
                image: bouture.images[0] ?? null,
                noteMoyenne: bouture.noteMoyenne ?? null,
                choixLibrairie: bouture.choixLibrairie,
                stock: bouture.stock,
            })
            .returning({ id: plantes.id });
        planteIdMap.set(bouture.id, row.id);
    }
    console.log(`Boutures : ${sortedBoutures.length}`);

    // Événements
    const now = new Date();
    const evenementsData = [
        {
            titre: 'Rencontre avec Baptiste Morizot',
            description:
                "L'auteur de « Manières d'être vivant » dialogue avec notre équipe autour de la question du vivant et de notre rapport aux autres espèces. Entrée libre, places limitées.",
            lieu: 'Lecture & Bouture — espace principal',
            dateDebut: new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                15,
                18,
                30,
            ),
            dateFin: new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                15,
                20,
                30,
            ),
            publie: true,
        },
        {
            titre: 'Atelier boutures : multiplier ses plantes',
            description:
                'Apportez une bouture de chez vous, repartez avec trois nouvelles. Matériel fourni. Animé par notre botaniste. Inscription obligatoire — 8 places.',
            lieu: 'Serre de la boutique',
            dateDebut: new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                22,
                10,
                0,
            ),
            dateFin: new Date(
                now.getFullYear(),
                now.getMonth() + 1,
                22,
                12,
                30,
            ),
            publie: true,
        },
        {
            titre: 'Lecture à voix haute — Thoreau',
            description:
                'Une heure de lecture partagée autour de Walden. Passages choisis, discussion ouverte. Apportez votre propre exemplaire si vous en avez un.',
            lieu: 'Coin lecture, fond de boutique',
            dateDebut: new Date(
                now.getFullYear(),
                now.getMonth() + 2,
                5,
                19,
                0,
            ),
            dateFin: new Date(now.getFullYear(), now.getMonth() + 2, 5, 20, 0),
            publie: true,
        },
        {
            titre: 'Vernissage — « Planches botaniques »',
            description:
                "Exposition de planches botaniques originales. Aquarelles d'Élise Fontaine. Présente le soir du vernissage.",
            lieu: 'Galerie attenante',
            dateDebut: new Date(
                now.getFullYear(),
                now.getMonth() - 1,
                10,
                18,
                0,
            ),
            dateFin: new Date(now.getFullYear(), now.getMonth() - 1, 10, 21, 0),
            publie: true,
        },
        {
            titre: 'Dédicace — Francis Hallé',
            description:
                "Séance de dédicace exceptionnelle autour de l'Herbier du Monde. File d'attente dès 14h.",
            lieu: 'Lecture & Bouture',
            dateDebut: new Date(
                now.getFullYear(),
                now.getMonth() - 2,
                18,
                15,
                0,
            ),
            dateFin: new Date(now.getFullYear(), now.getMonth() - 2, 18, 18, 0),
            publie: true,
        },
    ];
    for (const ev of evenementsData) {
        await db.insert(evenements).values(ev);
    }
    console.log(`Événements : ${evenementsData.length}`);

    // Pages éditoriales
    const conceptContenu =
        '<h2>Une librairie qui ne ressemble pas à une librairie</h2>' +
        "<p>Lecture &amp; Boutures est née d'une conviction simple : les livres et les plantes partagent la même exigence. Ils demandent du temps, de l'attention, un espace pour exister. Ils ne s'imposent pas — ils s'offrent à qui prend la peine de les choisir.</p>" +
        "<p>Notre boutique réunit ces deux mondes sous le même toit. Côté livres, une sélection soignée de titres académiques, de littérature de fond et d'essais qui méritent d'être lus lentement. Côté boutures, des spécimens rares choisis pour leur caractère, accompagnés de conseils d'entretien fiables.</p>" +
        '<h2>Le rôle du conservateur</h2>' +
        '<p>Chaque titre présent dans notre catalogue a été lu, tenu en mains, discuté. Notre équipe ne référence pas : elle sélectionne. Cette différence est notre engagement principal.</p>' +
        "<p>La « Sélection du conservateur » regroupe ce que nous aimons vraiment — des livres pour lesquels nous pouvons répondre en personne. Elle évolue selon les saisons, les lectures, les découvertes. Pas d'algorithme, pas de bestseller par défaut.</p>" +
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

    // Paramètres
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
