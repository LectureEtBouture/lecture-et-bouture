import postgres from 'postgres';
import { config } from 'dotenv';

config({ path: '.env.local' });

const client = postgres(process.env['DATABASE_URL'] as string);

const statements = [
    `DO $$ BEGIN CREATE TYPE difficulte_plante AS ENUM ('facile', 'moyen', 'difficile'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE lumiere_plante AS ENUM ('ombre', 'mi-ombre', 'lumiere-vive', 'plein-soleil'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE arrosage_plante AS ENUM ('rare', 'modere', 'regulier', 'abondant'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE avis_type AS ENUM ('livre', 'plante'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE TYPE role_utilisateur AS ENUM ('super_admin', 'admin', 'editor', 'moderator', 'contributor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

    `CREATE TABLE IF NOT EXISTS genres (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nom varchar(100) NOT NULL,
        slug varchar(100) NOT NULL UNIQUE
    )`,

    `CREATE TABLE IF NOT EXISTS rayons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        nom varchar(150) NOT NULL,
        slug varchar(150) NOT NULL UNIQUE,
        description text
    )`,

    `CREATE TABLE IF NOT EXISTS livres (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        inventaire_uri text NOT NULL UNIQUE,
        rayon_id uuid REFERENCES rayons(id),
        prix decimal(8,2),
        choix_librairie boolean NOT NULL DEFAULT false,
        note_de_la_librairie text,
        numero_serie integer,
        note_moyenne decimal(3,2),
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,

    `ALTER TABLE livres ADD COLUMN IF NOT EXISTS titre text`,

    `CREATE TABLE IF NOT EXISTS livres_genres (
        livre_id uuid NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
        genre_id uuid NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
        PRIMARY KEY (livre_id, genre_id)
    )`,

    `CREATE TABLE IF NOT EXISTS plantes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
        image_alt text,
        note_moyenne decimal(3,2),
        choix_librairie boolean NOT NULL DEFAULT false,
        stock integer NOT NULL DEFAULT 0,
        note_de_la_librairie text,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS selections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        titre varchar(200) NOT NULL,
        description text,
        ordre integer NOT NULL DEFAULT 0,
        active boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS selection_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        selection_id uuid NOT NULL REFERENCES selections(id) ON DELETE CASCADE,
        type avis_type NOT NULL,
        livre_id uuid REFERENCES livres(id) ON DELETE CASCADE,
        plante_id uuid REFERENCES plantes(id) ON DELETE CASCADE,
        ordre integer NOT NULL DEFAULT 0
    )`,

    `CREATE TABLE IF NOT EXISTS avis (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        type text NOT NULL,
        livre_id uuid,
        bouture_id uuid,
        produit_nom varchar(300),
        auteur_nom varchar(100) NOT NULL,
        note integer NOT NULL,
        texte text,
        approuve boolean NOT NULL DEFAULT false,
        masque boolean NOT NULL DEFAULT false,
        created_at timestamp NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS evenements (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        titre varchar(300) NOT NULL,
        description text,
        lieu varchar(300),
        date_debut timestamp NOT NULL,
        date_fin timestamp,
        image text,
        image_alt text,
        publie boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(200) NOT NULL UNIQUE,
        password_hash varchar(255) NOT NULL,
        role role_utilisateur NOT NULL DEFAULT 'admin',
        reset_token varchar(255),
        reset_token_expires_at timestamp,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS parametres (
        cle varchar(100) PRIMARY KEY,
        valeur text NOT NULL,
        updated_at timestamp NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS admin_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES users(id) ON DELETE SET NULL,
        user_email varchar(200) NOT NULL,
        action varchar(100) NOT NULL,
        entity_type varchar(50),
        entity_id varchar(36),
        entity_label varchar(300),
        created_at timestamp NOT NULL DEFAULT now()
    )`,

    `CREATE TABLE IF NOT EXISTS pages_editoriales (
        slug varchar(100) PRIMARY KEY,
        titre varchar(200) NOT NULL,
        contenu text,
        publiee boolean NOT NULL DEFAULT true,
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
