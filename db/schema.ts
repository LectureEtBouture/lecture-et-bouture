import {
    pgTable,
    serial,
    text,
    varchar,
    decimal,
    integer,
    boolean,
    timestamp,
    pgEnum,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const difficultePlante = pgEnum('difficulte_plante', [
    'facile',
    'moyen',
    'difficile',
]);

export const lumierePlante = pgEnum('lumiere_plante', [
    'ombre',
    'mi-ombre',
    'lumiere-vive',
    'plein-soleil',
]);

export const arrosagePlante = pgEnum('arrosage_plante', [
    'rare',
    'modere',
    'regulier',
    'abondant',
]);

export const avisType = pgEnum('avis_type', ['livre', 'plante']);

// ─── Genres ───────────────────────────────────────────────────────────────────

export const genres = pgTable('genres', {
    id: serial('id').primaryKey(),
    nom: varchar('nom', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
});

// ─── Rayons ───────────────────────────────────────────────────────────────────

export const rayons = pgTable('rayons', {
    id: serial('id').primaryKey(),
    nom: varchar('nom', { length: 150 }).notNull(),
    slug: varchar('slug', { length: 150 }).notNull().unique(),
    description: text('description'),
});

// ─── Livres ───────────────────────────────────────────────────────────────────

export const livres = pgTable('livres', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    titre: varchar('titre', { length: 300 }).notNull(),
    auteur: varchar('auteur', { length: 200 }).notNull(),
    isbn: varchar('isbn', { length: 20 }),
    genreId: integer('genre_id').references(() => genres.id),
    rayonId: integer('rayon_id').references(() => rayons.id),
    editeur: varchar('editeur', { length: 200 }),
    collection: varchar('collection', { length: 200 }),
    format: varchar('format', { length: 100 }),
    edition: varchar('edition', { length: 100 }),
    anneePublication: integer('annee_publication'),
    serie: varchar('serie', { length: 200 }),
    numeroSerie: integer('numero_serie'),
    prix: decimal('prix', { precision: 8, scale: 2 }).notNull(),
    description: text('description'),
    image: text('image'),
    noteMoyenne: decimal('note_moyenne', { precision: 3, scale: 2 }),
    choixLibrairie: boolean('choix_librairie').notNull().default(false),
    stock: integer('stock').notNull().default(0),
    noteDeLaLibrairie: text('note_de_la_librairie'),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Plantes ──────────────────────────────────────────────────────────────────

export const plantes = pgTable('plantes', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    nom: varchar('nom', { length: 200 }).notNull(),
    espece: varchar('espece', { length: 200 }),
    famille: varchar('famille', { length: 200 }),
    prix: decimal('prix', { precision: 8, scale: 2 }).notNull(),
    description: text('description'),
    conseilsEntretien: text('conseils_entretien'),
    difficulte: difficultePlante('difficulte'),
    lumiere: lumierePlante('lumiere'),
    arrosage: arrosagePlante('arrosage'),
    image: text('image'),
    noteMoyenne: decimal('note_moyenne', { precision: 3, scale: 2 }),
    choixLibrairie: boolean('choix_librairie').notNull().default(false),
    stock: integer('stock').notNull().default(0),
    noteDeLaLibrairie: text('note_de_la_librairie'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Sélections du conservateur ───────────────────────────────────────────────

export const selections = pgTable('selections', {
    id: serial('id').primaryKey(),
    titre: varchar('titre', { length: 200 }).notNull(),
    description: text('description'),
    ordre: integer('ordre').notNull().default(0),
    active: boolean('active').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const selectionItems = pgTable('selection_items', {
    id: serial('id').primaryKey(),
    selectionId: integer('selection_id')
        .notNull()
        .references(() => selections.id, { onDelete: 'cascade' }),
    type: avisType('type').notNull(),
    livreId: integer('livre_id').references(() => livres.id, {
        onDelete: 'cascade',
    }),
    planteId: integer('plante_id').references(() => plantes.id, {
        onDelete: 'cascade',
    }),
    ordre: integer('ordre').notNull().default(0),
});

// ─── Avis ─────────────────────────────────────────────────────────────────────

export const avis = pgTable('avis', {
    id: serial('id').primaryKey(),
    type: text('type').notNull(), // 'livre' | 'bouture'
    livreId: integer('livre_id'),
    boutureId: integer('bouture_id'),
    produitNom: varchar('produit_nom', { length: 300 }),
    auteurNom: varchar('auteur_nom', { length: 100 }).notNull(),
    note: integer('note').notNull(), // 1-5
    texte: text('texte'),
    approuve: boolean('approuve').notNull().default(false),
    masque: boolean('masque').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Événements ───────────────────────────────────────────────────────────────

export const evenements = pgTable('evenements', {
    id: serial('id').primaryKey(),
    titre: varchar('titre', { length: 300 }).notNull(),
    description: text('description'),
    lieu: varchar('lieu', { length: 300 }),
    dateDebut: timestamp('date_debut').notNull(),
    dateFin: timestamp('date_fin'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Admin users ──────────────────────────────────────────────────────────────

export const adminUsers = pgTable('admin_users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 200 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Pages éditoriales ────────────────────────────────────────────────────────

export const pagesEditoriales = pgTable('pages_editoriales', {
    slug: varchar('slug', { length: 100 }).primaryKey(),
    titre: varchar('titre', { length: 200 }).notNull(),
    contenu: text('contenu'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
