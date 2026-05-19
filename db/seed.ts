import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
import {
    genres,
    rayons,
    livres,
    plantes,
    avis,
    evenements,
    selections,
    selectionItems,
    pagesEditoriales,
} from './schema';
import genresJson from '../data/genres.json';
import rayonsJson from '../data/rayons.json';
import livresJson from '../data/livres.json';
import bouturesJson from '../data/boutures.json';
import avisJson from '../data/avis.json';
import selectionsJson from '../data/selections.json';

config({ path: '.env.local' });

const client = postgres(process.env['DATABASE_URL'] as string);
const db = drizzle(client);

async function main() {
    await db.execute(
        sql`TRUNCATE TABLE avis, selection_items, evenements, livres, plantes, selections, genres, rayons RESTART IDENTITY CASCADE`,
    );
    await db.execute(sql`TRUNCATE TABLE pages_editoriales`);

    // Genres
    const sortedGenres = [...genresJson].sort((a, b) => a.id - b.id);
    for (const genre of sortedGenres) {
        await db.insert(genres).values({ nom: genre.nom, slug: genre.slug });
    }
    console.log(`Genres : ${sortedGenres.length}`);

    // Rayons
    const sortedRayons = [...rayonsJson].sort((a, b) => a.id - b.id);
    for (const rayon of sortedRayons) {
        await db.insert(rayons).values({
            nom: rayon.nom,
            slug: rayon.slug,
            description:
                (rayon as { description?: string }).description ?? null,
        });
    }
    console.log(`Rayons : ${sortedRayons.length}`);

    // Livres
    const sortedLivres = [...livresJson].sort((a, b) => a.id - b.id);
    for (const livre of sortedLivres) {
        await db.insert(livres).values({
            slug: livre.slug,
            titre: livre.titre,
            auteur: livre.auteur,
            isbn: livre.isbn ?? null,
            genreId: livre.genreId ?? null,
            rayonId: livre.rayonId ?? null,
            editeur: livre.editeur ?? null,
            collection: livre.collection ?? null,
            format: livre.format ?? null,
            edition: (livre as { edition?: string | null }).edition ?? null,
            anneePublication: livre.anneePublication ?? null,
            serie: (livre as { serie?: string | null }).serie ?? null,
            numeroSerie:
                (livre as { numeroSerie?: number | null }).numeroSerie ?? null,
            prix: String(livre.prix),
            description: livre.description ?? null,
            image: livre.image ?? null,
            noteMoyenne: livre.noteMoyenne ? String(livre.noteMoyenne) : null,
            choixLibrairie: livre.choixLibrairie ?? false,
            stock: livre.stock ?? 0,
            noteDeLaLibrairie: livre.noteDeLaLibrairie ?? null,
            publishedAt: livre.publishedAt ? new Date(livre.publishedAt) : null,
        });
    }
    console.log(`Livres : ${sortedLivres.length}`);

    // Plantes / boutures
    const sortedBoutures = [...bouturesJson].sort((a, b) => a.id - b.id);
    for (const bouture of sortedBoutures) {
        await db.insert(plantes).values({
            slug: bouture.slug,
            nom: bouture.nom,
            espece: bouture.espece ?? null,
            famille: bouture.famille ?? null,
            prix: String(bouture.prix),
            description: bouture.description ?? null,
            conseilsEntretien: bouture.conseilsEntretien ?? null,
            difficulte: (bouture.difficulte ?? null) as
                | 'facile'
                | 'moyen'
                | 'difficile'
                | null,
            lumiere: (bouture.lumiere ?? null) as
                | 'ombre'
                | 'mi-ombre'
                | 'lumiere-vive'
                | 'plein-soleil'
                | null,
            arrosage: (bouture.arrosage ?? null) as
                | 'rare'
                | 'modere'
                | 'regulier'
                | 'abondant'
                | null,
            image: Array.isArray((bouture as { images?: string[] }).images)
                ? ((bouture as { images: string[] }).images[0] ?? null)
                : null,
            noteMoyenne: bouture.noteMoyenne
                ? String(bouture.noteMoyenne)
                : null,
            choixLibrairie:
                (bouture as { choixLibrairie?: boolean }).choixLibrairie ??
                false,
            stock: (bouture as { stock?: number }).stock ?? 0,
        });
    }
    console.log(`Boutures : ${sortedBoutures.length}`);

    // Avis
    for (const a of avisJson) {
        await db.insert(avis).values({
            type: a.type === 'plante' ? 'bouture' : a.type,
            livreId: a.livreId ?? null,
            boutureId: a.planteId ?? null,
            produitNom: null,
            auteurNom: a.auteurNom,
            note: a.note,
            texte: a.texte ?? null,
            approuve: a.approuve,
            masque: false,
        });
    }
    // Avis non approuvés pour test de modération
    await db.insert(avis).values({
        type: 'livre',
        livreId: 3,
        boutureId: null,
        produitNom: null,
        auteurNom: 'Marie L.',
        note: 4,
        texte: null,
        approuve: false,
        masque: false,
    });
    console.log(`Avis : ${avisJson.length + 1}`);

    // Événements
    const now = new Date();
    const evenementsData = [
        {
            titre: 'Rencontre avec Baptiste Morizot',
            description:
                "L'auteur de « Manières d'être vivant » dialogue avec notre équipe autour de la question du vivant et de notre rapport aux autres espèces. Entrée libre, places limitées.",
            lieu: 'Lecture & Boutures — espace principal',
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
        },
        {
            titre: 'Vernissage — « Planches botaniques »',
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
        },
        {
            titre: 'Dédicace — Francis Hallé',
            description:
                "Séance de dédicace exceptionnelle autour de l'Herbier du Monde. File d'attente dès 14h.",
            lieu: 'Lecture & Boutures',
            dateDebut: new Date(
                now.getFullYear(),
                now.getMonth() - 2,
                18,
                15,
                0,
            ),
            dateFin: new Date(now.getFullYear(), now.getMonth() - 2, 18, 18, 0),
        },
    ];
    for (const ev of evenementsData) {
        await db.insert(evenements).values(ev);
    }
    console.log(`Événements : ${evenementsData.length}`);

    // Sélections
    type SelectionJson = {
        id: number;
        titre: string;
        description: string;
        ordre: number;
        active: boolean;
        items: { type: string; id: number }[];
    };
    const sortedSelections = [...(selectionsJson as SelectionJson[])].sort(
        (a, b) => a.id - b.id,
    );
    for (const sel of sortedSelections) {
        await db.insert(selections).values({
            titre: sel.titre,
            description: sel.description,
            ordre: sel.ordre,
            active: sel.active,
        });

        for (const [index, item] of sel.items.entries()) {
            const isLivre = item.type === 'livre';
            await db.insert(selectionItems).values({
                selectionId: sel.id,
                type: isLivre ? 'livre' : 'plante',
                livreId: isLivre ? item.id : null,
                planteId: isLivre ? null : item.id,
                ordre: index,
            });
        }
    }
    console.log(`Sélections : ${sortedSelections.length}`);

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
        {
            slug: 'cgv',
            titre: 'Conditions Générales de Vente',
            contenu: null,
        },
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

    for (const pageData of pagesInitiales) {
        await db.insert(pagesEditoriales).values(pageData);
    }
    console.log(`Pages éditoriales : ${pagesInitiales.length}`);

    await client.end();
    console.log('Seed terminé.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
