import {
    pgTable,
    primaryKey,
    uuid,
    text,
    varchar,
    decimal,
    integer,
    boolean,
    timestamp,
    pgEnum,
    check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

export const roleUtilisateur = pgEnum('role_utilisateur', [
    'super_admin',
    'admin',
    'editor',
    'moderator',
    'contributor',
]);

// ─── Genres ───────────────────────────────────────────────────────────────────

export const genres = pgTable('genres', {
    id: uuid('id').primaryKey().defaultRandom(),
    nom: varchar('nom', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
});

// ─── Rayons ───────────────────────────────────────────────────────────────────

export const rayons = pgTable('rayons', {
    id: uuid('id').primaryKey().defaultRandom(),
    nom: varchar('nom', { length: 150 }).notNull(),
    slug: varchar('slug', { length: 150 }).notNull().unique(),
    description: text('description'),
});

// ─── Livres ───────────────────────────────────────────────────────────────────

export const livres = pgTable('livres', {
    id: uuid('id').primaryKey().defaultRandom(),
    inventaireUri: text('inventaire_uri').notNull().unique(),
    titre: text('titre'),
    rayonId: uuid('rayon_id').references(() => rayons.id),
    prix: decimal('prix', { precision: 8, scale: 2 }),
    choixLibrairie: boolean('choix_librairie').notNull().default(false),
    noteDeLaLibrairie: text('note_de_la_librairie'),
    description: text('description'),
    numeroSerie: integer('numero_serie'),
    noteMoyenne: decimal('note_moyenne', { precision: 3, scale: 2 }),
    image: text('image'),
    imageAlt: text('image_alt'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const livresGenres = pgTable(
    'livres_genres',
    {
        livreId: uuid('livre_id')
            .notNull()
            .references(() => livres.id, { onDelete: 'cascade' }),
        genreId: uuid('genre_id')
            .notNull()
            .references(() => genres.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.livreId, t.genreId] })],
);

// ─── Plantes ──────────────────────────────────────────────────────────────────

export const plantes = pgTable('plantes', {
    id: uuid('id').primaryKey().defaultRandom(),
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
    imageAlt: text('image_alt'),
    noteMoyenne: decimal('note_moyenne', { precision: 3, scale: 2 }),
    choixLibrairie: boolean('choix_librairie').notNull().default(false),
    stock: integer('stock').notNull().default(0),
    noteDeLaLibrairie: text('note_de_la_librairie'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Sélections de la libraire ───────────────────────────────────────────────

export const selections = pgTable('selections', {
    id: uuid('id').primaryKey().defaultRandom(),
    titre: varchar('titre', { length: 200 }).notNull(),
    description: text('description'),
    ordre: integer('ordre').notNull().default(0),
    active: boolean('active').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const selectionItems = pgTable('selection_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    selectionId: uuid('selection_id')
        .notNull()
        .references(() => selections.id, { onDelete: 'cascade' }),
    type: avisType('type').notNull(),
    livreId: uuid('livre_id').references(() => livres.id, {
        onDelete: 'cascade',
    }),
    planteId: uuid('plante_id').references(() => plantes.id, {
        onDelete: 'cascade',
    }),
    ordre: integer('ordre').notNull().default(0),
});

// ─── Avis ─────────────────────────────────────────────────────────────────────

export const avis = pgTable('avis', {
    id: uuid('id').primaryKey().defaultRandom(),
    type: text('type').notNull(), // 'livre' | 'bouture' | 'article'
    livreId: uuid('livre_id'),
    boutureId: uuid('bouture_id'),
    articleId: uuid('article_id'),
    produitNom: varchar('produit_nom', { length: 300 }),
    auteurNom: varchar('auteur_nom', { length: 100 }).notNull(),
    note: integer('note'), // 1-5, null for article avis
    texte: text('texte'),
    approuve: boolean('approuve').notNull().default(false),
    masque: boolean('masque').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Événements ───────────────────────────────────────────────────────────────

export const evenements = pgTable('evenements', {
    id: uuid('id').primaryKey().defaultRandom(),
    titre: varchar('titre', { length: 300 }).notNull(),
    description: text('description'),
    lieu: varchar('lieu', { length: 300 }),
    dateDebut: timestamp('date_debut').notNull(),
    dateFin: timestamp('date_fin'),
    image: text('image'),
    imageAlt: text('image_alt'),
    publie: boolean('publie').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Utilisateurs ─────────────────────────────────────────────────────────────

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 200 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: roleUtilisateur('role').notNull().default('admin'),
    resetToken: varchar('reset_token', { length: 255 }),
    resetTokenExpiresAt: timestamp('reset_token_expires_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Paramètres boutique ──────────────────────────────────────────────────────

export const parametres = pgTable('parametres', {
    cle: varchar('cle', { length: 100 }).primaryKey(),
    valeur: text('valeur').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Journaux admin ───────────────────────────────────────────────────────────

export const adminLogs = pgTable('admin_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, {
        onDelete: 'set null',
    }),
    userEmail: varchar('user_email', { length: 200 }).notNull(),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }),
    entityId: varchar('entity_id', { length: 36 }),
    entityLabel: varchar('entity_label', { length: 300 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Pages éditoriales ────────────────────────────────────────────────────────

export const pagesEditoriales = pgTable('pages_editoriales', {
    slug: varchar('slug', { length: 100 }).primaryKey(),
    titre: varchar('titre', { length: 200 }).notNull(),
    contenu: text('contenu'),
    publiee: boolean('publiee').notNull().default(true),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ─── Blog ─────────────────────────────────────────────────────────────────────

export const auteursBlog = pgTable('auteurs_blog', {
    id: uuid('id').primaryKey().defaultRandom(),
    nom: varchar('nom', { length: 200 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categoriesBlog = pgTable('categories_blog', {
    id: uuid('id').primaryKey().defaultRandom(),
    nom: varchar('nom', { length: 200 }).notNull(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articles = pgTable('articles', {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: varchar('slug', { length: 200 }).notNull().unique(),
    titre: varchar('titre', { length: 300 }).notNull(),
    contenu: text('contenu'),
    image: text('image'),
    imageAlt: text('image_alt'),
    auteurNom: varchar('auteur_nom', { length: 200 }),
    publie: boolean('publie').notNull().default(false),
    enAvant: boolean('en_avant').notNull().default(false),
    publishedAt: timestamp('published_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const articlesCategories = pgTable(
    'articles_categories',
    {
        articleId: uuid('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        categorieId: uuid('categorie_id')
            .notNull()
            .references(() => categoriesBlog.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.articleId, t.categorieId] })],
);

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 254 }).notNull().unique(),
    subscribedAt: timestamp('subscribed_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const diffusions = pgTable('diffusions', {
    id: uuid('id').primaryKey().defaultRandom(),
    articleId: uuid('article_id')
        .notNull()
        .references(() => articles.id, { onDelete: 'cascade' }),
    sentAt: timestamp('sent_at', { withTimezone: true }).notNull().defaultNow(),
    recipientCount: integer('recipient_count').notNull(),
});

export const tagsBlog = pgTable('tags_blog', {
    id: uuid('id').primaryKey().defaultRandom(),
    nom: varchar('nom', { length: 100 }).notNull().unique(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const articlesTags = pgTable(
    'articles_tags',
    {
        articleId: uuid('article_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        tagId: uuid('tag_id')
            .notNull()
            .references(() => tagsBlog.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.articleId, t.tagId] })],
);

export const articlesLies = pgTable(
    'articles_lies',
    {
        articleAId: uuid('article_a_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
        articleBId: uuid('article_b_id')
            .notNull()
            .references(() => articles.id, { onDelete: 'cascade' }),
    },
    (t) => [
        primaryKey({ columns: [t.articleAId, t.articleBId] }),
        check('articles_lies_order', sql`${t.articleAId} < ${t.articleBId}`),
    ],
);
