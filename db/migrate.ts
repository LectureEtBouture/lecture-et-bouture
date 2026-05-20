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
        slug varchar(200) NOT NULL UNIQUE,
        titre varchar(300) NOT NULL,
        auteur varchar(200) NOT NULL,
        isbn varchar(20),
        rayon_id uuid REFERENCES rayons(id),
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
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
    `DO $$ BEGIN CREATE TYPE role_utilisateur AS ENUM ('super_admin', 'admin', 'editor', 'moderator', 'contributor'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN ALTER TYPE role_utilisateur ADD VALUE IF NOT EXISTS 'contributor'; EXCEPTION WHEN others THEN NULL; END $$`,
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
    `DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='admin_users') THEN
            INSERT INTO users (email, password_hash, created_at)
                SELECT email, password_hash, created_at FROM admin_users
                ON CONFLICT (email) DO NOTHING;
            DROP TABLE admin_users;
        END IF;
    END $$`,
    `CREATE TABLE IF NOT EXISTS pages_editoriales (
        slug varchar(100) PRIMARY KEY,
        titre varchar(200) NOT NULL,
        contenu text,
        updated_at timestamp NOT NULL DEFAULT now()
    )`,
    `ALTER TABLE evenements ADD COLUMN IF NOT EXISTS publie boolean NOT NULL DEFAULT true`,
    `ALTER TABLE evenements ADD COLUMN IF NOT EXISTS image text`,
    `ALTER TABLE pages_editoriales ADD COLUMN IF NOT EXISTS publiee boolean NOT NULL DEFAULT true`,
    `CREATE TABLE IF NOT EXISTS livres_genres (
        livre_id uuid NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
        genre_id uuid NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
        PRIMARY KEY (livre_id, genre_id)
    )`,
    // Migration serial → uuid pour les tables existantes
    `DO $$ DECLARE v_count int; BEGIN
        SELECT count(*) INTO v_count FROM information_schema.columns
            WHERE table_name='genres' AND column_name='id' AND data_type='integer';
        IF v_count > 0 THEN
            ALTER TABLE genres ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE rayons ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE livres ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE livres ADD COLUMN rayon_uuid uuid;
            ALTER TABLE plantes ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE avis ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE avis ADD COLUMN livre_uuid uuid;
            ALTER TABLE avis ADD COLUMN bouture_uuid uuid;
            ALTER TABLE evenements ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE selections ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE selection_items ADD COLUMN uuid_id uuid DEFAULT gen_random_uuid();
            ALTER TABLE selection_items ADD COLUMN selection_uuid uuid;
            ALTER TABLE selection_items ADD COLUMN livre_item_uuid uuid;
            ALTER TABLE selection_items ADD COLUMN plante_item_uuid uuid;
            ALTER TABLE livres_genres ADD COLUMN livre_uuid uuid;
            ALTER TABLE livres_genres ADD COLUMN genre_uuid uuid;

            UPDATE livres SET rayon_uuid = r.uuid_id FROM rayons r WHERE livres.rayon_id = r.id;
            UPDATE avis SET livre_uuid = l.uuid_id FROM livres l WHERE avis.livre_id = l.id;
            UPDATE avis SET bouture_uuid = p.uuid_id FROM plantes p WHERE avis.bouture_id = p.id;
            UPDATE livres_genres SET livre_uuid = l.uuid_id FROM livres l WHERE livres_genres.livre_id = l.id;
            UPDATE livres_genres SET genre_uuid = g.uuid_id FROM genres g WHERE livres_genres.genre_id = g.id;
            UPDATE selection_items SET selection_uuid = s.uuid_id FROM selections s WHERE selection_items.selection_id = s.id;
            UPDATE selection_items SET livre_item_uuid = l.uuid_id FROM livres l WHERE selection_items.livre_id = l.id;
            UPDATE selection_items SET plante_item_uuid = p.uuid_id FROM plantes p WHERE selection_items.plante_id = p.id;

            CREATE TEMP TABLE livres_genres_backup AS
                SELECT livre_uuid, genre_uuid FROM livres_genres
                WHERE livre_uuid IS NOT NULL AND genre_uuid IS NOT NULL;

            DROP TABLE livres_genres;

            ALTER TABLE genres DROP CONSTRAINT genres_pkey CASCADE;
            ALTER TABLE genres DROP COLUMN id;
            ALTER TABLE genres RENAME COLUMN uuid_id TO id;
            ALTER TABLE genres ADD PRIMARY KEY (id);

            ALTER TABLE rayons DROP CONSTRAINT rayons_pkey CASCADE;
            ALTER TABLE rayons DROP COLUMN id;
            ALTER TABLE rayons RENAME COLUMN uuid_id TO id;
            ALTER TABLE rayons ADD PRIMARY KEY (id);

            ALTER TABLE livres DROP CONSTRAINT livres_pkey CASCADE;
            ALTER TABLE livres DROP COLUMN id;
            ALTER TABLE livres RENAME COLUMN uuid_id TO id;
            ALTER TABLE livres ADD PRIMARY KEY (id);
            ALTER TABLE livres DROP COLUMN rayon_id;
            ALTER TABLE livres RENAME COLUMN rayon_uuid TO rayon_id;
            ALTER TABLE livres ADD CONSTRAINT livres_rayon_id_fkey FOREIGN KEY (rayon_id) REFERENCES rayons(id);

            ALTER TABLE plantes DROP CONSTRAINT plantes_pkey CASCADE;
            ALTER TABLE plantes DROP COLUMN id;
            ALTER TABLE plantes RENAME COLUMN uuid_id TO id;
            ALTER TABLE plantes ADD PRIMARY KEY (id);

            ALTER TABLE avis DROP CONSTRAINT avis_pkey;
            ALTER TABLE avis DROP COLUMN id;
            ALTER TABLE avis RENAME COLUMN uuid_id TO id;
            ALTER TABLE avis ADD PRIMARY KEY (id);
            ALTER TABLE avis DROP COLUMN livre_id;
            ALTER TABLE avis RENAME COLUMN livre_uuid TO livre_id;
            ALTER TABLE avis DROP COLUMN bouture_id;
            ALTER TABLE avis RENAME COLUMN bouture_uuid TO bouture_id;

            ALTER TABLE evenements DROP CONSTRAINT evenements_pkey;
            ALTER TABLE evenements DROP COLUMN id;
            ALTER TABLE evenements RENAME COLUMN uuid_id TO id;
            ALTER TABLE evenements ADD PRIMARY KEY (id);

            ALTER TABLE selections DROP CONSTRAINT selections_pkey CASCADE;
            ALTER TABLE selections DROP COLUMN id;
            ALTER TABLE selections RENAME COLUMN uuid_id TO id;
            ALTER TABLE selections ADD PRIMARY KEY (id);

            ALTER TABLE selection_items DROP COLUMN id;
            ALTER TABLE selection_items RENAME COLUMN uuid_id TO id;
            ALTER TABLE selection_items ADD PRIMARY KEY (id);
            ALTER TABLE selection_items DROP COLUMN selection_id;
            ALTER TABLE selection_items RENAME COLUMN selection_uuid TO selection_id;
            ALTER TABLE selection_items ADD CONSTRAINT si_selection_id_fkey FOREIGN KEY (selection_id) REFERENCES selections(id) ON DELETE CASCADE;
            ALTER TABLE selection_items DROP COLUMN livre_id;
            ALTER TABLE selection_items RENAME COLUMN livre_item_uuid TO livre_id;
            ALTER TABLE selection_items ADD CONSTRAINT si_livre_id_fkey FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE;
            ALTER TABLE selection_items DROP COLUMN plante_id;
            ALTER TABLE selection_items RENAME COLUMN plante_item_uuid TO plante_id;
            ALTER TABLE selection_items ADD CONSTRAINT si_plante_id_fkey FOREIGN KEY (plante_id) REFERENCES plantes(id) ON DELETE CASCADE;

            CREATE TABLE livres_genres (
                livre_id uuid NOT NULL REFERENCES livres(id) ON DELETE CASCADE,
                genre_id uuid NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
                PRIMARY KEY (livre_id, genre_id)
            );
            INSERT INTO livres_genres SELECT livre_uuid, genre_uuid FROM livres_genres_backup;
        END IF;
    END $$`,
    `DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='livres' AND column_name='genre_id') THEN
            INSERT INTO livres_genres (livre_id, genre_id)
                SELECT id, genre_id FROM livres WHERE genre_id IS NOT NULL
                ON CONFLICT DO NOTHING;
        END IF;
    END $$`,
    `ALTER TABLE livres DROP COLUMN IF EXISTS genre_id`,
    `ALTER TABLE livres ADD COLUMN IF NOT EXISTS image_alt text`,
    `ALTER TABLE plantes ADD COLUMN IF NOT EXISTS image_alt text`,
    `ALTER TABLE evenements ADD COLUMN IF NOT EXISTS image_alt text`,
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
    `DO $$ BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name='admin_logs' AND column_name='user_id'
            AND is_nullable='NO'
        ) THEN
            ALTER TABLE admin_logs ALTER COLUMN user_id DROP NOT NULL;
            ALTER TABLE admin_logs ADD CONSTRAINT admin_logs_user_id_fkey
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
        END IF;
    END $$`,
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
