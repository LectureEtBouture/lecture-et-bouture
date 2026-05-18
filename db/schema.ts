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

// ─── Livres ───────────────────────────────────────────────────────────────────

export const livres = pgTable('livres', {
    id: serial('id').primaryKey(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    titre: varchar('titre', { length: 300 }).notNull(),
    auteur: varchar('auteur', { length: 200 }).notNull(),
    isbn: varchar('isbn', { length: 20 }),
    genreId: integer('genre_id').references(() => genres.id),
    prix: decimal('prix', { precision: 8, scale: 2 }).notNull(),
    description: text('description'),
    images: text('images').array(),
    noteMoyenne: decimal('note_moyenne', { precision: 3, scale: 2 }),
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
    images: text('images').array(),
    noteMoyenne: decimal('note_moyenne', { precision: 3, scale: 2 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Sélections du conservateur ───────────────────────────────────────────────

export const selections = pgTable('selections', {
    id: serial('id').primaryKey(),
    titre: varchar('titre', { length: 200 }).notNull(),
    description: text('description'),
    ordre: integer('ordre').notNull().default(0),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// items polymorphiques : livre OU plante
export const selectionItems = pgTable('selection_items', {
    id: serial('id').primaryKey(),
    selectionId: integer('selection_id')
        .notNull()
        .references(() => selections.id, { onDelete: 'cascade' }),
    type: avisType('type').notNull(), // réutilise enum livre|plante
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
    type: avisType('type').notNull(),
    livreId: integer('livre_id').references(() => livres.id, {
        onDelete: 'cascade',
    }),
    planteId: integer('plante_id').references(() => plantes.id, {
        onDelete: 'cascade',
    }),
    auteurNom: varchar('auteur_nom', { length: 100 }).notNull(),
    note: integer('note').notNull(), // 1-5
    texte: text('texte'),
    approuve: boolean('approuve').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Admin users ──────────────────────────────────────────────────────────────

export const adminUsers = pgTable('admin_users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 200 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
