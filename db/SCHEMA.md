# Schéma de base de données

PostgreSQL 16. ORM : Drizzle. Fichier source : `db/schema.ts`.

## Tables

### `genres`

Genres littéraires (Philosophie, Botanique, etc.).

| Colonne | Type         | Contraintes      |
| ------- | ------------ | ---------------- |
| id      | serial       | PK               |
| nom     | varchar(100) | NOT NULL         |
| slug    | varchar(100) | NOT NULL, UNIQUE |

### `rayons`

Rayons thématiques (Sciences & Nature, Imaginaire, etc.) — catégories de navigation.

| Colonne     | Type         | Contraintes      |
| ----------- | ------------ | ---------------- |
| id          | serial       | PK               |
| nom         | varchar(150) | NOT NULL         |
| slug        | varchar(150) | NOT NULL, UNIQUE |
| description | text         | nullable         |

### `livres`

Catalogue livres.

| Colonne              | Type         | Contraintes                        |
| -------------------- | ------------ | ---------------------------------- |
| id                   | serial       | PK                                 |
| slug                 | varchar(200) | NOT NULL, UNIQUE                   |
| titre                | varchar(300) | NOT NULL                           |
| auteur               | varchar(200) | NOT NULL                           |
| isbn                 | varchar(20)  | nullable                           |
| genre_id             | integer      | FK → genres.id                     |
| rayon_id             | integer      | FK → rayons.id                     |
| editeur              | varchar(200) | nullable                           |
| collection           | varchar(200) | nullable                           |
| format               | varchar(100) | nullable (relié / poche / broché…) |
| edition              | varchar(100) | nullable                           |
| annee_publication    | integer      | nullable                           |
| serie                | varchar(200) | nullable                           |
| numero_serie         | integer      | nullable                           |
| prix                 | numeric(8,2) | NOT NULL                           |
| description          | text         | nullable                           |
| image                | text         | nullable (URL)                     |
| note_moyenne         | numeric(3,2) | nullable                           |
| choix_librairie      | boolean      | NOT NULL, DEFAULT false            |
| stock                | integer      | NOT NULL, DEFAULT 0                |
| note_de_la_librairie | text         | nullable                           |
| published_at         | timestamp    | nullable                           |
| created_at           | timestamp    | NOT NULL, DEFAULT now()            |
| updated_at           | timestamp    | NOT NULL, DEFAULT now()            |

### `plantes`

Catalogue boutures / plantes.

| Colonne              | Type                                              | Contraintes             |
| -------------------- | ------------------------------------------------- | ----------------------- |
| id                   | serial                                            | PK                      |
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
| image                | text                                              | nullable (URL)          |
| note_moyenne         | numeric(3,2)                                      | nullable                |
| choix_librairie      | boolean                                           | NOT NULL, DEFAULT false |
| stock                | integer                                           | NOT NULL, DEFAULT 0     |
| note_de_la_librairie | text                                              | nullable                |
| created_at           | timestamp                                         | NOT NULL, DEFAULT now() |
| updated_at           | timestamp                                         | NOT NULL, DEFAULT now() |

### `avis`

Avis clients — livres et boutures.

| Colonne     | Type         | Contraintes                            |
| ----------- | ------------ | -------------------------------------- |
| id          | serial       | PK                                     |
| type        | text         | NOT NULL — `'livre'` ou `'bouture'`    |
| livre_id    | integer      | nullable                               |
| bouture_id  | integer      | nullable                               |
| produit_nom | varchar(300) | nullable (snapshot au moment du dépôt) |
| auteur_nom  | varchar(100) | NOT NULL                               |
| note        | integer      | NOT NULL (1–5)                         |
| texte       | text         | nullable                               |
| approuve    | boolean      | NOT NULL, DEFAULT false                |
| masque      | boolean      | NOT NULL, DEFAULT false                |
| created_at  | timestamp    | NOT NULL, DEFAULT now()                |

> `livre_id` et `bouture_id` n'ont pas de FK (supprimées en migration 0001 pour permettre des avis orphelins si le produit est retiré).

### `evenements`

Agenda de la librairie.

| Colonne     | Type         | Contraintes             |
| ----------- | ------------ | ----------------------- |
| id          | serial       | PK                      |
| titre       | varchar(300) | NOT NULL                |
| description | text         | nullable                |
| lieu        | varchar(300) | nullable                |
| date_debut  | timestamp    | NOT NULL                |
| date_fin    | timestamp    | nullable                |
| created_at  | timestamp    | NOT NULL, DEFAULT now() |
| updated_at  | timestamp    | NOT NULL, DEFAULT now() |

### `selections`

Sélections du conservateur — listes curatées mixant livres et boutures.

| Colonne     | Type         | Contraintes                                |
| ----------- | ------------ | ------------------------------------------ |
| id          | serial       | PK                                         |
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
| id           | serial              | PK                                            |
| selection_id | integer             | NOT NULL, FK → selections.id (CASCADE DELETE) |
| type         | enum(livre, plante) | NOT NULL                                      |
| livre_id     | integer             | nullable, FK → livres.id (CASCADE DELETE)     |
| plante_id    | integer             | nullable, FK → plantes.id (CASCADE DELETE)    |
| ordre        | integer             | NOT NULL, DEFAULT 0                           |

### `admin_users`

Comptes back-office.

| Colonne       | Type         | Contraintes             |
| ------------- | ------------ | ----------------------- |
| id            | serial       | PK                      |
| email         | varchar(200) | NOT NULL, UNIQUE        |
| password_hash | varchar(255) | NOT NULL (Argon2id)     |
| created_at    | timestamp    | NOT NULL, DEFAULT now() |

## Enums PostgreSQL

| Nom                 | Valeurs                                                        |
| ------------------- | -------------------------------------------------------------- |
| `difficulte_plante` | facile, moyen, difficile                                       |
| `lumiere_plante`    | ombre, mi-ombre, lumiere-vive, plein-soleil                    |
| `arrosage_plante`   | rare, modere, regulier, abondant                               |
| `avis_type`         | livre, plante — utilisé dans `selection_items.type` uniquement |

## Commandes

```bash
npm run db:generate    # Génère une migration Drizzle après modif du schéma
npm run db:migrate     # Applique les migrations en attente
npm run db:seed        # Insère les données de seed (truncate + réinsert)
npm run db:reset       # Reset complet : drop schéma → migrate → seed
npm run db:studio      # Interface Drizzle Studio
```

## Notes

- `selections.active = false` par défaut — une sélection est privée jusqu'à publication explicite.
- `avis.masque` permet de masquer un avis sans le supprimer (différent de `approuve`).
- `plantes.image` est une URL simple (texte) — pas de tableau. Les images boutures seront gérées via MinIO quand le module upload sera implémenté.
- Les `prix` sont stockés en `numeric(8,2)` — Drizzle les renvoie en string JavaScript, pas en number.
