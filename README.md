# Lecture & Bouture

Boutique hybride livres + boutures végétales. Catalogue livres via Google Books API (source de vérité), enrichissements éditoriaux en base locale, achat via leslibraires.fr.

## Stack

| Couche               | Choix                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------- |
| Framework            | Next.js 16 App Router — front + back-office + API Routes                                    |
| Base de données      | PostgreSQL 16 + Drizzle ORM (PKs uuid, migrations SQL idempotentes)                         |
| Auth                 | NextAuth v5 — JWT, httpOnly cookies, 5 rôles                                                |
| **Catalogue public** | **Google Books API** — browse, search, discovery (tendances/nouveautés/genres)              |
| **Import BO**        | **Google Books API** (défaut) — `BOOK_IMPORT_PROVIDER=inventaire` ou `wikidata` pour forcer |
| Stockage images      | MinIO self-hosted (livres, boutures, événements)                                            |
| Rich text            | Tiptap — pages éditoriales                                                                  |
| Email                | Resend — reset password + notifications                                                     |
| Newsletter           | Loops                                                                                       |
| Analytics            | Umami (privacy-first)                                                                       |
| Fonts                | Raleway (sans) + Noto Serif + Dancing Script (`--font-manuscript`, note librairie)          |
| Proxy                | Caddy (HTTPS local)                                                                         |
| Outils dev           | Adminer, Portainer, Drizzle Studio                                                          |

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
isEbook, prixNum.         image custom (prioritaire sur GB/OL)
nombrePages               imageAlt custom
                          avis
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

| Service       | URL                          |
| ------------- | ---------------------------- |
| App           | https://localhost:3000       |
| Back-office   | https://localhost:3000/admin |
| Adminer       | http://localhost:8080        |
| Portainer     | http://localhost:9000        |
| MinIO console | http://localhost:9101        |
| MinIO API     | http://localhost:9100        |

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

Voir `.env.example` pour la liste complète. Valeurs minimales :

```env
DATABASE_URL=postgresql://leb:leb@localhost:5432/leb
AUTH_SECRET=<openssl rand -base64 33>
AUTH_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
PREVIEW_SECRET=<openssl rand -base64 20>
GOOGLE_BOOKS_API_KEY=

NEXT_PUBLIC_STORE_NAME=Lecture & Bouture
NEXT_PUBLIC_STORE_URL=https://lectureetbouture.fr
NEXT_PUBLIC_STORE_LOCALE=fr_FR

MINIO_ENDPOINT=localhost
MINIO_PORT=9100
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_BUCKET=leb
MINIO_PUBLIC_URL=http://localhost:9100/leb

RESEND_API_KEY=
LOOPS_API_KEY=

BOOK_IMPORT_PROVIDER=               # vide = Google Books (défaut) | inventaire | wikidata
WIKIDATA_ACCESS_TOKEN=              # requis si BOOK_IMPORT_PROVIDER=wikidata
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

- `/` — Hero + Choix librairie + Nouveautés + Tendances + sections genre (Google Books) + bento blog en avant
- `/livres` — 3 modes : découverte (infinite scroll GB), catalogue (filtres DB), recherche (live GB + BISAC)
- `/livres/[slug]` — fiche complète : description HTML (masquée si non-FR ou < 20 chars), catégories BISAC traduites, date dd/mm/yyyy, pages, ebook, aperçu. Avis avant recos. Recos : même genre (DB) + même auteur (`inauthor:`) + même univers (BISAC rayon)
- `/blog` — listing (lede + rows, filtres catégorie + tri recents/anciens/A-Z), extrait toujours présent, layouts image / sans image
- `/blog/[slug]` — article complet : contenu HTML sanitisé, catégories, articles liés + même catégorie en pied, avis sans note
- `/boutures` — vitrine bento
- `/boutures/[slug]` — fiche avec avis
- `/surprendre` — livre aléatoire parmi les choix librairie
- `/evenements` — agenda (en cours / à venir / passé)
- `/selections` — sélections actives de la libraire
- `/contact` — formulaire + carte Leaflet
- `/ma-liste` — wishlist localStorage, sélection de livres, demande de disponibilité (`POST /api/disponibilite` → Resend)
- Pages éditoriales — concept, mentions légales, CGV, CGU, cookies, politique
- Nudge social proof — toast SSE bottom-left sur toutes les pages front quand une demande de dispo est soumise (titres cliquables, auto-dismiss 6s, émetteur exclu)

### Back-office (`/admin`)

- Dashboard — stats, alertes, agenda
- Livres — CRUD + import ISBN (Google Books, inventaire.io via env) + recherche titre/auteur + liste avec titre & couverture (batch Google Books)
- Blog — CRUD articles (Tiptap, image, catégories, en avant, articles liés optimistic), CRUD catégories & auteurs
- Boutures, Genres, Rayons — CRUD
- Avis — modération 3 états (livres, boutures, articles), titre + couverture du livre affichés, lien fiche front
- Sélections, Événements — CRUD + ordre/toggle
- Pages éditoriales — Tiptap + prévisualisation Draft Mode
- Paramètres — horaires, fermetures, annonce, maintenance, réseaux sociaux, QR code
- Utilisateurs — CRUD + rôles (voir `ROLES.md`)
- Journaux — FIFO 200, guard `super_admin`

### Infra

- PostgreSQL + Drizzle — PKs uuid, migrations idempotentes
- MinIO — images livres, boutures, événements
- Google Books API — import BO : ISBN → préremplissage formulaire enrichissement (inventaire.io/wikidata via `BOOK_IMPORT_PROVIDER`)
- Docker — image prod `sankarej/lecture-et-bouture` sur Docker Hub · voir `DEPLOY.md`

---

## Backlog

- Formbricks — vérifier trigger survey (`NEXT_PUBLIC_FORMBRICKS_ENV_ID`)
- ~~Meilisearch~~ — obsolète, recherche full-text assurée par Google Books API
- API leslibraires.fr / Librisoft — stocks temps réel, panier, commandes
- Éco-conception — audit thegreenwebfoundation.org
- Resend — câbler clé API en prod (workaround try/catch temporaire dans `/api/disponibilite`)
