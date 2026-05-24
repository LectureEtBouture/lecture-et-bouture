# Schéma de base de données

PostgreSQL 16. ORM : Drizzle. Fichier source : `db/schema.ts`.

## Tables

### `genres`

Genres littéraires (Philosophie, Botanique, etc.).

| Colonne | Type         | Contraintes                   |
| ------- | ------------ | ----------------------------- |
| id      | uuid         | PK, DEFAULT gen_random_uuid() |
| nom     | varchar(100) | NOT NULL                      |
| slug    | varchar(100) | NOT NULL, UNIQUE              |

### `rayons`

Rayons thématiques (Sciences & Nature, Imaginaire, etc.) — catégories de navigation.

| Colonne     | Type         | Contraintes      |
| ----------- | ------------ | ---------------- |
| id          | uuid         | PK               |
| nom         | varchar(150) | NOT NULL         |
| slug        | varchar(150) | NOT NULL, UNIQUE |
| description | text         | nullable         |

### `livres`

Table d'**enrichissements** principalement. Les métadonnées catalogue (auteur, isbn, éditeur, description, image…) sont gérées par l'API externe (Google Books / inventaire.io). Seul `titre` est dénormalisé localement à des fins d'affichage BO (évite un appel API sur chaque page liste/modifier).

| Colonne              | Type         | Contraintes                                                    |
| -------------------- | ------------ | -------------------------------------------------------------- |
| id                   | uuid         | PK                                                             |
| inventaire_uri       | text         | NOT NULL, UNIQUE — ex: `isbn:9782070347858`                    |
| titre                | text         | nullable (snapshot, renseigné au save du form)                 |
| rayon_id             | uuid         | FK → rayons.id, nullable                                       |
| prix                 | numeric(8,2) | nullable (indicatif, surchargeable)                            |
| choix_librairie      | boolean      | NOT NULL, DEFAULT false                                        |
| note_de_la_librairie | text         | nullable                                                       |
| description          | text         | nullable (surcouche HTML Tiptap, prioritaire sur Google Books) |
| numero_serie         | integer      | nullable                                                       |
| note_moyenne         | numeric(3,2) | nullable                                                       |
| image                | text         | nullable (couverture personnalisée MinIO)                      |
| image_alt            | text         | nullable                                                       |
| created_at           | timestamp    | NOT NULL, DEFAULT now()                                        |
| updated_at           | timestamp    | NOT NULL, DEFAULT now()                                        |

> Slugs publics dérivés de `inventaire_uri` : `isbn:9782070347858` → slug `9782070347858`, `wd:Q43361` → slug `wd-Q43361`. Logique dans `lib/services/books/slug.ts`.

### `livres_genres`

Relation N-N livres ↔ genres.

| Colonne  | Type | Contraintes                               |
| -------- | ---- | ----------------------------------------- |
| livre_id | uuid | NOT NULL, FK → livres.id (CASCADE DELETE) |
| genre_id | uuid | NOT NULL, FK → genres.id (CASCADE DELETE) |
| PK       | —    | (livre_id, genre_id)                      |

### `plantes`

Catalogue boutures / plantes.

| Colonne              | Type                                              | Contraintes             |
| -------------------- | ------------------------------------------------- | ----------------------- |
| id                   | uuid                                              | PK                      |
| slug                 | varchar(200)                                      | NOT NULL, UNIQUE        |
| nom                  | varchar(200)                                      | NOT NULL                |
| espece               | varchar(200)                                      | nullable                |
| famille              | varchar(200)                                      | nullable                |
| prix                 | numeric(8,2)                                      | NOT NULL                |
| description          | text                                              | nullable                |
| conseils_entretien   | text                                              | nullable                |
| difficulte           | enum(facile, moyen, difficile)                    | nullable                |
| lumiere              | enum(ombre, mi-ombre, lumiere-vive, plein-soleil) | nullable                |
| arrosage             | enum(rare, modere, regulier, abondant)            | nullable                |
| image                | text                                              | nullable (chemin MinIO) |
| image_alt            | text                                              | nullable                |
| note_moyenne         | numeric(3,2)                                      | nullable                |
| choix_librairie      | boolean                                           | NOT NULL, DEFAULT false |
| stock                | integer                                           | NOT NULL, DEFAULT 0     |
| note_de_la_librairie | text                                              | nullable                |
| created_at           | timestamp                                         | NOT NULL, DEFAULT now() |
| updated_at           | timestamp                                         | NOT NULL, DEFAULT now() |

### `avis`

Avis clients — livres, boutures et articles blog.

| Colonne     | Type         | Contraintes                                      |
| ----------- | ------------ | ------------------------------------------------ |
| id          | uuid         | PK                                               |
| type        | text         | NOT NULL — `'livre'`, `'bouture'` ou `'article'` |
| livre_id    | uuid         | nullable (pas de FK — avis orphelins OK)         |
| bouture_id  | uuid         | nullable                                         |
| article_id  | uuid         | nullable, FK → articles.id (ON DELETE SET NULL)  |
| produit_nom | varchar(300) | nullable (snapshot au dépôt)                     |
| auteur_nom  | varchar(100) | NOT NULL                                         |
| note        | integer      | **nullable** — absent pour les articles          |
| texte       | text         | nullable                                         |
| approuve    | boolean      | NOT NULL, DEFAULT false                          |
| masque      | boolean      | NOT NULL, DEFAULT false                          |
| created_at  | timestamp    | NOT NULL, DEFAULT now()                          |

> `livre_id` FK → `livres.id`. `bouture_id` et `article_id` sans FK stricte — permet des avis orphelins. `note` nullable depuis la migration blog (les avis articles n'ont pas de note étoiles).

### `auteurs_blog`

Suggestions d'auteurs pour le blog (champ libre avec datalist).

| Colonne    | Type         | Contraintes             |
| ---------- | ------------ | ----------------------- |
| id         | uuid         | PK                      |
| nom        | varchar(200) | NOT NULL, UNIQUE        |
| created_at | timestamp    | NOT NULL, DEFAULT now() |

### `categories_blog`

Catégories des articles blog.

| Colonne    | Type         | Contraintes             |
| ---------- | ------------ | ----------------------- |
| id         | uuid         | PK                      |
| nom        | varchar(200) | NOT NULL                |
| slug       | varchar(200) | NOT NULL, UNIQUE        |
| created_at | timestamp    | NOT NULL, DEFAULT now() |

### `articles`

Articles du blog.

| Colonne      | Type         | Contraintes                         |
| ------------ | ------------ | ----------------------------------- |
| id           | uuid         | PK                                  |
| slug         | varchar(200) | NOT NULL, UNIQUE                    |
| titre        | varchar(300) | NOT NULL                            |
| contenu      | text         | nullable (HTML Tiptap sanitisé)     |
| image        | text         | nullable (chemin MinIO)             |
| image_alt    | text         | nullable                            |
| auteur_nom   | varchar(200) | nullable (champ libre, suggestions) |
| publie       | boolean      | NOT NULL, DEFAULT false             |
| en_avant     | boolean      | NOT NULL, DEFAULT false             |
| published_at | timestamp    | nullable (null = brouillon)         |
| created_at   | timestamp    | NOT NULL, DEFAULT now()             |
| updated_at   | timestamp    | NOT NULL, DEFAULT now()             |

> `publie` passe à `true` + `published_at` est horodaté à la première publication (via `togglePublie`). Les articles en avant (`en_avant = true`) alimentent la section blog de la home — fallback récents si aucun.

### `articles_categories`

Relation N-N articles ↔ catégories blog.

| Colonne      | Type | Contraintes                                        |
| ------------ | ---- | -------------------------------------------------- |
| article_id   | uuid | NOT NULL, FK → articles.id (CASCADE DELETE)        |
| categorie_id | uuid | NOT NULL, FK → categories_blog.id (CASCADE DELETE) |
| PK           | —    | (article_id, categorie_id)                         |

### `articles_lies`

Liens bidirectionnels entre articles (ex: articles complémentaires).

| Colonne      | Type | Contraintes                                  |
| ------------ | ---- | -------------------------------------------- |
| article_a_id | uuid | NOT NULL, FK → articles.id (CASCADE DELETE)  |
| article_b_id | uuid | NOT NULL, FK → articles.id (CASCADE DELETE)  |
| PK           | —    | (article_a_id, article_b_id)                 |
| CHECK        | —    | `article_a_id < article_b_id` (anti-doublon) |

> Relation symétrique stockée une seule fois avec l'ID le plus petit en `article_a_id`. Les queries utilisent `OR` sur les deux colonnes (via `unionAll`) pour retrouver tous les liens d'un article.

### `evenements`

Agenda de la librairie.

| Colonne     | Type         | Contraintes             |
| ----------- | ------------ | ----------------------- |
| id          | uuid         | PK                      |
| titre       | varchar(300) | NOT NULL                |
| description | text         | nullable                |
| lieu        | varchar(300) | nullable                |
| date_debut  | timestamp    | NOT NULL                |
| date_fin    | timestamp    | nullable                |
| publie      | boolean      | NOT NULL, DEFAULT true  |
| image       | text         | nullable (chemin MinIO) |
| image_alt   | text         | nullable                |
| created_at  | timestamp    | NOT NULL, DEFAULT now() |
| updated_at  | timestamp    | NOT NULL, DEFAULT now() |

### `selections`

Sélections de la libraire — listes curatées mixant livres et boutures.

| Colonne     | Type         | Contraintes                                |
| ----------- | ------------ | ------------------------------------------ |
| id          | uuid         | PK                                         |
| titre       | varchar(200) | NOT NULL                                   |
| description | text         | nullable                                   |
| ordre       | integer      | NOT NULL, DEFAULT 0                        |
| active      | boolean      | NOT NULL, DEFAULT false (privé par défaut) |
| created_at  | timestamp    | NOT NULL, DEFAULT now()                    |
| updated_at  | timestamp    | NOT NULL, DEFAULT now()                    |

### `selection_items`

Items d'une sélection (livre ou plante).

| Colonne      | Type                | Contraintes                                   |
| ------------ | ------------------- | --------------------------------------------- |
| id           | uuid                | PK                                            |
| selection_id | uuid                | NOT NULL, FK → selections.id (CASCADE DELETE) |
| type         | enum(livre, plante) | NOT NULL                                      |
| livre_id     | uuid                | nullable, FK → livres.id (CASCADE DELETE)     |
| plante_id    | uuid                | nullable, FK → plantes.id (CASCADE DELETE)    |
| ordre        | integer             | NOT NULL, DEFAULT 0                           |

### `pages_editoriales`

Pages de contenu éditorial (concept, mentions légales, CGV…).

| Colonne    | Type         | Contraintes             |
| ---------- | ------------ | ----------------------- |
| slug       | varchar(100) | PK                      |
| titre      | varchar(200) | NOT NULL                |
| contenu    | text         | nullable (HTML Tiptap)  |
| publiee    | boolean      | NOT NULL, DEFAULT true  |
| updated_at | timestamp    | NOT NULL, DEFAULT now() |

### `parametres`

Table clé-valeur pour la configuration librairie (horaires, annonce, réseaux sociaux, maintenance…).

| Colonne    | Type         | Contraintes             |
| ---------- | ------------ | ----------------------- |
| cle        | varchar(100) | PK                      |
| valeur     | text         | NOT NULL                |
| updated_at | timestamp    | NOT NULL, DEFAULT now() |

### `users`

Comptes back-office.

| Colonne                | Type                   | Contraintes               |
| ---------------------- | ---------------------- | ------------------------- |
| id                     | uuid                   | PK                        |
| email                  | varchar(200)           | NOT NULL, UNIQUE          |
| password_hash          | varchar(255)           | NOT NULL (Argon2id)       |
| role                   | enum(role_utilisateur) | NOT NULL, DEFAULT 'admin' |
| reset_token            | varchar(255)           | nullable                  |
| reset_token_expires_at | timestamp              | nullable                  |
| created_at             | timestamp              | NOT NULL, DEFAULT now()   |
| updated_at             | timestamp              | NOT NULL, DEFAULT now()   |

### `admin_logs`

Journal d'actions back-office — FIFO 200 entrées.

| Colonne      | Type         | Contraintes                                  |
| ------------ | ------------ | -------------------------------------------- |
| id           | uuid         | PK                                           |
| user_id      | uuid         | nullable, FK → users.id (ON DELETE SET NULL) |
| user_email   | varchar(200) | NOT NULL (dénormalisé pour traçabilité)      |
| action       | varchar(100) | NOT NULL (ex: `livre.create`)                |
| entity_type  | varchar(50)  | nullable                                     |
| entity_id    | varchar(36)  | nullable                                     |
| entity_label | varchar(300) | nullable                                     |
| created_at   | timestamp    | NOT NULL, DEFAULT now()                      |

> FIFO : `createLog` supprime les entrées au-delà des 200 plus récentes après chaque insertion.

## Enums PostgreSQL

| Nom                 | Valeurs                                                        |
| ------------------- | -------------------------------------------------------------- |
| `difficulte_plante` | facile, moyen, difficile                                       |
| `lumiere_plante`    | ombre, mi-ombre, lumiere-vive, plein-soleil                    |
| `arrosage_plante`   | rare, modere, regulier, abondant                               |
| `avis_type`         | livre, plante — utilisé dans `selection_items.type` uniquement |
| `role_utilisateur`  | super_admin, admin, editor, moderator, contributor             |

## Commandes

```bash
npm run db:migrate     # Applique les migrations (idempotent, SQL brut)
npm run db:seed        # Insère les données de seed (truncate + réinsert)
npm run db:reset       # Reset complet : drop schéma → migrate → seed
npm run db:studio      # Interface Drizzle Studio
```

## Notes

- PKs uuid sur toutes les tables — `gen_random_uuid()`.
- `livres.inventaire_uri` — clé de liaison avec l'API externe (ex: `isbn:9782070347858`, `wd:Q43361`). NOT NULL UNIQUE.
- `livres.titre` — dénormalisé pour le BO (liste + heading modifier), évite un appel API. NULL pour les livres créés avant la migration — fallback sur Google Books dans la liste admin.
- `livres.prix` est stocké en `numeric(8,2)` — Drizzle le renvoie en string JavaScript. Nullable (indicatif, peut être surchargé par l'admin).
- `livres.image` — couverture personnalisée uploadée via MinIO. Prioritaire sur l'image Google Books dans `merge.ts`. Si null, Google Books / Open Library est utilisé en fallback.
- `selections.active = false` par défaut — une sélection est privée jusqu'à publication explicite.
- `avis.masque` permet de masquer sans supprimer (distinct de `approuve`).
- Images : chemin MinIO relatif (ex: `livres/mon-image.jpg`) ou URL externe. Résolu via `MINIO_PUBLIC_URL` dans `next.config.ts`.
