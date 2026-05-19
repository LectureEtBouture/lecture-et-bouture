import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = postgres(process.env['DATABASE_URL'] as string);

const statements = [
    `DO $$ BEGIN CREATE TYPE difficulte_plante AS ENUM ('facile', 'moyen', 'difficile'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE lumiere_plante AS ENUM ('ombre', 'mi-ombre', 'lumiere-vive', 'plein-soleil'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE arrosage_plante AS ENUM ('rare', 'modere', 'regulier', 'abondant'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE avis_type AS ENUM ('livre', 'plante'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `CREATE TABLE IF NOT EXISTS genres (
        id serial PRIMARY KEY,
        nom varchar(100) NOT NULL,
        slug varchar(100) NOT NULL UNIQUE
    )`,
    `CREATE TABLE IF NOT EXISTS rayons (
        id serial PRIMARY KEY,
        nom varchar(150) NOT NULL,
        slug varchar(150) NOT NULL UNIQUE,
        description text
    )`,
    `CREATE TABLE IF NOT EXISTS livres (
        id serial PRIMARY KEY,
        slug varchar(200) NOT NULL UNIQUE,
        titre varchar(300) NOT NULL,
        auteur varchar(200) NOT NULL,
        isbn varchar(20),
        genre_id integer REFERENCES genres(id),
        rayon_id integer REFERENCES rayons(id),
        editeur varchar(200),
        collection varchar(200),
        format varchar(100),
        edition varchar(100),
        annee_publication integer,
        serie varchar(200),
        numero_serie integer,
        prix decimal(8,2) NOT NULL,
        description text,
        image text,
        note_moyenne decimal(3,2),
        choix_librairie boolean NOT NULL DEFAULT false,
        stock integer NOT NULL DEFAULT 0,
        note_de_la_librairie text,
        published_at timestamp,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS plantes (
        id serial PRIMARY KEY,
        slug varchar(200) NOT NULL UNIQUE,
        nom varchar(200) NOT NULL,
        espece varchar(200),
        famille varchar(200),
        prix decimal(8,2) NOT NULL,
        description text,
        conseils_entretien text,
        difficulte difficulte_plante,
        lumiere lumiere_plante,
        arrosage arrosage_plante,
        image text,
        note_moyenne decimal(3,2),
        choix_librairie boolean NOT NULL DEFAULT false,
        stock integer NOT NULL DEFAULT 0,
        note_de_la_librairie text,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS selections (
        id serial PRIMARY KEY,
        titre varchar(200) NOT NULL,
        description text,
        ordre integer NOT NULL DEFAULT 0,
        active boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS selection_items (
        id serial PRIMARY KEY,
        selection_id integer NOT NULL REFERENCES selections(id) ON DELETE CASCADE,
        type avis_type NOT NULL,
        livre_id integer REFERENCES livres(id) ON DELETE CASCADE,
        plante_id integer REFERENCES plantes(id) ON DELETE CASCADE,
        ordre integer NOT NULL DEFAULT 0
    )`,
    `CREATE TABLE IF NOT EXISTS avis (
        id serial PRIMARY KEY,
        type text NOT NULL,
        livre_id integer,
        bouture_id integer,
        produit_nom varchar(300),
        auteur_nom varchar(100) NOT NULL,
        note integer NOT NULL,
        texte text,
        approuve boolean NOT NULL DEFAULT false,
        masque boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS evenements (
        id serial PRIMARY KEY,
        titre varchar(300) NOT NULL,
        description text,
        lieu varchar(300),
        date_debut timestamp NOT NULL,
        date_fin timestamp,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS admin_users (
        id serial PRIMARY KEY,
        email varchar(200) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        created_at timestamp NOT NULL DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS pages_editoriales (
        slug varchar(100) PRIMARY KEY,
        titre varchar(200) NOT NULL,
        contenu text,
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
    `ALTER TABLE evenements ADD COLUMN IF NOT EXISTS publie boolean NOT NULL DEFAULT true`,
    `ALTER TABLE pages_editoriales ADD COLUMN IF NOT EXISTS publiee boolean NOT NULL DEFAULT true`,
    `CREATE TABLE IF NOT EXISTS parametres (
        cle varchar(100) PRIMARY KEY,
        valeur text NOT NULL,
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
];

async function main() {
    for (const stmt of statements) {
        await client.unsafe(stmt);
    }
    await client.end();
    console.log('Migration terminée.');
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
