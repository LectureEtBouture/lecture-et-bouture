# Lecture & Bouture

Boutique hybride livres + boutures végétales. Catalogue livres via Google Books API (source de vérité), enrichissements éditoriaux en base locale, achat via leslibraires.fr.

## Stack

| Couche               | Choix                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| Framework            | Next.js 16 App Router — front + back-office + API Routes                               |
| Base de données      | PostgreSQL 16 + Drizzle ORM (PKs uuid, migrations SQL idempotentes)                    |
| Auth                 | NextAuth v5 — JWT, httpOnly cookies, 5 rôles                                           |
| **Catalogue public** | **Google Books API** — browse, search, discovery (tendances/nouveautés/genres)         |
| **Import BO**        | **inventaire.io + Open Library** — enrichissement métadonnées FR lors de l'import ISBN |
| Stockage images      | MinIO self-hosted (livres, boutures, événements)                                       |
| Rich text            | Tiptap — pages éditoriales                                                             |
| Email                | Resend — reset password + notifications                                                |
| Newsletter           | Loops                                                                                  |
| Analytics            | Umami (privacy-first)                                                                  |
| Fonts                | Raleway (principal) + Dancing Script (note librairie)                                  |
| Proxy                | Caddy (HTTPS local)                                                                    |
| Outils dev           | Adminer, Portainer, Drizzle Studio                                                     |

---

## Architecture livres

**Source de vérité = Google Books API.** La base locale ne stocke que les enrichissements éditoriaux.

```
Google Books API          DB locale (livres)
─────────────────         ──────────────────
titre, auteur             inventaire_uri (clé de liaison)
isbn, éditeur             titre (dénormalisé BO, snapshot)
description (HTML)        rayon, genres
image (zoom=0)            prix indicatif
catégories BISAC          note librairie
previewLink               choix librairie
isEbook, prixNum.         avis
nombrePages
```

**Modes d'affichage `/livres` :**

- **Découverte** (défaut, pas de filtre) : Choix librairie (DB) → Tendances (GB `orderBy=relevance`) → Nouveautés (GB `orderBy=newest`). Infinite scroll via `startIndex` (step 40). Pas de `langRestrict` — requêtes françaises assurent la pertinence.
- **Catalogue** (filtres DB : rayon/genre/choix) : enrichissements + overlay métadonnées GB. Tri : alpha, date, note, prix (toujours visible).
- **Recherche** (`?q=...`) : live Google Books, 40 par batch, enrichis en overlay, infinite scroll. Si rayon actif : termes BISAC français injectés dans la query. Expansion auteur si < 4 résultats physiques d'un même auteur.
- **Toggle ebook** (`?ebook=1`, défaut off) : filtre post-fetch applicable sur toutes les vues.
- **Pagination** : offset API toujours en multiples de 40 (évite les slices chevauchantes après filtre ebook). Bouton "Charger plus" en fallback de l'IntersectionObserver.

**URI format :** `isbn:XXXXXXXXXXXXX` → slug `XXXXXXXXXXXXX` · `gbid:VOLUMEID` → slug `gbid-VOLUMEID`

---

## Prérequis

- Node.js 20+
- Docker Desktop

---

## Installation

```bash
npm install
cp .env.example .env.local
# Remplir les vars (voir section Variables d'environnement)
```

---

## Démarrage

```bash
# 1. Services Docker (PostgreSQL, MinIO, Adminer, Portainer)
docker compose up -d

# 2. Migrations + seed
npm run db:migrate
npm run db:seed

# 3. App
npm run dev
```

---

## URLs

| Service        | URL                          |
| -------------- | ---------------------------- |
| App            | https://localhost:3000       |
| Back-office    | https://localhost:3000/admin |
| Adminer        | http://localhost:8080        |
| Portainer      | http://localhost:9000        |
| MinIO console  | http://localhost:9101        |
| MinIO API      | http://localhost:9100        |

**Adminer** : serveur `leb-db` · user `leb` · password `leb` · db `leb`

---

## Base de données

```bash
npm run db:migrate    # créer/mettre à jour les tables (idempotent)
npm run db:seed       # peupler avec données de démo
npm run db:reset      # drop + migrate + seed
npm run db:studio     # Drizzle Studio (UI)
```

Schéma : `db/schema.ts` · `db/SCHEMA.md`

---

## Variables d'environnement

```env
# Base
DATABASE_URL=postgresql://leb:leb@localhost:5432/leb
AUTH_SECRET=<openssl rand -base64 33>
AUTH_URL=http://localhost:3000
PREVIEW_SECRET=<openssl rand -base64 20>

# Google Books API (catalogue public — browse, search, discovery)
GOOGLE_BOOKS_API_KEY=

# Boutique (config publique)
NEXT_PUBLIC_STORE_NAME=Lecture & Bouture
NEXT_PUBLIC_STORE_TAGLINE=Cultiver l'esprit, nourrir la terre.
NEXT_PUBLIC_STORE_DESCRIPTION=...
NEXT_PUBLIC_STORE_URL=https://lectureetbouture.fr
NEXT_PUBLIC_STORE_ADDRESS_STREET=...
NEXT_PUBLIC_STORE_ADDRESS_CITY=...
NEXT_PUBLIC_STORE_LAT=...
NEXT_PUBLIC_STORE_LNG=...
NEXT_PUBLIC_STORE_LOCALE=fr

# MinIO (stockage images)
MINIO_ENDPOINT=localhost
MINIO_PORT=9100
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=leb
MINIO_PUBLIC_URL=http://localhost:9100/leb

# Email (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=contact@lectureetbouture.fr
RESEND_TO_EMAIL=contact@lectureetbouture.fr

# Newsletter (Loops)
LOOPS_API_KEY=

# Analytics (Umami)
NEXT_PUBLIC_UMAMI_WEBSITE_ID=
NEXT_PUBLIC_UMAMI_HOST=https://cloud.umami.is

# Surveys (Formbricks)
NEXT_PUBLIC_FORMBRICKS_ENV_ID=
NEXT_PUBLIC_FORMBRICKS_HOST=

# Import livres BO (inventaire.io/wikidata)
BOOK_IMPORT_PROVIDER=inventaire     # inventaire (défaut) | wikidata
```

---

## Créer le premier admin

```bash
npm run admin:create <email> <mot-de-passe>
# Mot de passe minimum 12 caractères
```

---

## État du projet

### Front public

- `/` — Hero + Choix librairie + Nouveautés + Tendances + sections genre (Google Books)
- `/livres` — 3 modes : découverte (infinite scroll GB), catalogue (filtres DB), recherche (live GB + BISAC)
- `/livres/[slug]` — fiche complète : description HTML (masquée si non-FR ou < 20 chars), catégories BISAC traduites, date dd/mm/yyyy, pages, ebook, aperçu. Avis avant recos. Recos : même genre (DB) + même auteur (`inauthor:`) + même univers (BISAC rayon)
- `/boutures` — vitrine bento
- `/boutures/[slug]` — fiche avec avis
- `/surprendre` — livre aléatoire parmi les choix librairie
- `/evenements` — agenda (en cours / à venir / passé)
- `/selections` — sélections actives du conservateur
- `/contact` — formulaire + carte Leaflet
- Pages éditoriales — concept, mentions légales, CGV, CGU, cookies, politique

### Back-office (`/admin`)

- Dashboard — stats, alertes, agenda
- Livres — CRUD + import ISBN (inventaire.io) + recherche titre/auteur + liste avec titre & couverture (batch Google Books)
- Boutures, Genres, Rayons — CRUD
- Avis — modération 3 états, titre + couverture du livre affichés (batch fetch Google Books), lien vers fiche front
- Sélections, Événements — CRUD + ordre/toggle
- Pages éditoriales — Tiptap + prévisualisation Draft Mode
- Paramètres — horaires, fermetures, annonce, maintenance, réseaux sociaux, QR code
- Utilisateurs — CRUD + rôles (voir `ROLES.md`)
- Journaux — FIFO 200, guard `super_admin`

### Infra

- PostgreSQL + Drizzle — PKs uuid, migrations idempotentes
- MinIO — images livres, boutures, événements
- inventaire.io + Open Library — import BO : ISBN → préremplissage formulaire enrichissement

---

## Backlog

- Formbricks — vérifier trigger survey (`NEXT_PUBLIC_FORMBRICKS_ENV_ID`)
- ~~Meilisearch~~ — obsolète, recherche full-text assurée par Google Books API
- API leslibraires.fr / Librisoft — stocks temps réel, panier, commandes
- Éco-conception — audit thegreenwebfoundation.org
