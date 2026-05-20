# Lecture & Bouture

Boutique hybride livres académiques + boutures végétales.

## Stack

- **Next.js 16** (App Router) — front + back-office + API
- **PostgreSQL 16** — base de données
- **Drizzle ORM** — schéma typé
- **NextAuth v5** — auth back-office (JWT, httpOnly cookies)
- **Argon2id** — hashing mots de passe
- **Tiptap** — éditeur rich text (pages éditoriales, descriptions)
- **Raleway** — police principale (corps, UI)
- **Dancing Script** — police manuscrite (note de la librairie)
- **Caddy** — reverse proxy HTTPS local
- **Adminer** — interface BDD
- **Portainer** — interface Docker

---

## Prérequis

- Node.js 20+
- Docker Desktop

---

## Installation

```bash
npm install
```

---

## Démarrage

### 1. Lancer les services Docker

```bash
docker compose up -d
```

### 2. Lancer Next.js

```bash
npm run dev
```

---

## URLs

| Service        | URL                    |
| -------------- | ---------------------- |
| App            | https://localhost:3000 |
| Adminer        | http://localhost:8080  |
| Portainer      | http://localhost:9000  |
| LibreTranslate | http://localhost:5000  |

**Adminer** : serveur `leb-db` · user `leb` · password `leb` · db `leb`

---

## Base de données

```bash
# Créer les tables (idempotent — safe à rejouer)
npm run db:migrate

# Peupler avec les données de démo
npm run db:seed

# Reset complet (drop + migrate + seed)
npm run db:reset

# Interface Drizzle Studio
npm run db:studio
```

Schéma : `db/schema.ts`  
Migration : `db/migrate.ts` (SQL brut idempotent, une table à la fois)  
Seed : `db/seed.ts`  
Connexion : `db/index.ts`

Variables d'environnement dans `.env.local` :

```env
DATABASE_URL=postgresql://leb:leb@localhost:5432/leb
AUTH_SECRET=<générer avec: openssl rand -base64 33>
```

---

## Back-office

Accès : https://app.localhost/admin

### Créer le premier compte admin

```bash
npm run admin:create <email> <mot-de-passe>
```

Mot de passe minimum 12 caractères.

---

## Arrêter les services

```bash
docker compose down
```

---

## État du projet

### Front public

- Accueil — sections livres thématiques + événement mis en avant + CTA "Surprendre"
- `/livres` — catalogue avec filtres complets (rayon, genre, série, éditeur, format, tri, choix)
- `/livres/[slug]` — fiche avec avis et recommandations
- `/boutures` — vitrine bento (grande/petite carte alternées, section explicative)
- `/boutures/[slug]` — fiche avec avis
- `/surprendre` — livre aléatoire parmi les choix de la librairie
- `/evenements` — agenda avec état en cours / à venir / passé
- `/selections` — sélections actives du conservateur
- `/contact` — formulaire + section "Nous trouver" avec adresse et carte Leaflet (CartoDB light, SSR:false)
- `/concept`, `/mentions-legales`, `/cgv`, `/cgu`, `/cookies`, `/politique-de-confidentialite` — pages éditoriales (contenu géré via RTE en back-office)
- 404 et 500 custom

### Back-office

- Dashboard — stats, alertes, agenda
- Logo `leb-nobg.png` — nav + footer
- Navbar responsive — burger menu mobile (overlay, animation X)
- Livres — CRUD complet + filtres + tri
- Boutures — CRUD complet + filtres + tri
- Genres, Rayons — CRUD
- Avis — modération (3 états : en attente / visible / masqué) + toggle rapide par ligne
- Sélections — CRUD + ordre drag-and-drop
- Événements — CRUD + filtre état + tri date + toggle publié/privé par ligne
- Pages éditoriales — éditeur Tiptap riche + toggle publiée/privée par ligne
- Formulaire livre — section "Sélection librairie" repliable (choix librairie + note, indépendants)

### Infra

- PostgreSQL + Drizzle — migration SQL brute idempotente (pas de drizzle-kit push)
- Seed — livres, boutures, genres, rayons, avis, pages éditoriales, admin user
- sanitize-html côté serveur pour tout contenu RTE affiché en front

---

## Backlog

- Google Books API — ISBN → auto-fill + recherche titre autocomplete
- MinIO — stockage images boutures
- Meilisearch — recherche full-text (> ~500 entrées)
- Analytics Umami
- Newsletter Loops
- Éco-conception
