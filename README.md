# Lecture & Boutures

Boutique hybride livres académiques + boutures végétales.

## Stack

- **Next.js 16** (App Router) — front + back-office + API
- **PostgreSQL 16** — base de données
- **Drizzle ORM** — schéma et migrations
- **NextAuth v5** — auth back-office (JWT, httpOnly cookies)
- **Argon2id** — hashing mots de passe
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

| Service   | URL                   |
| --------- | --------------------- |
| App       | http://localhost:3000 |
| Adminer   | http://localhost:8080 |
| Portainer | http://localhost:9000 |

**Adminer** : serveur `leb-db` · user `leb` · password `leb` · db `leb`

---

## Base de données

```bash
# Générer une migration après modif du schéma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Interface Drizzle Studio
npm run db:studio
```

Schéma : `db/schema.ts`  
Connexion : `db/index.ts`  
Config : `drizzle.config.ts`

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

### Back-office — fait

- Dashboard : stats, alertes ruptures/avis, agenda événements
- Livres : CRUD complet, filtres rayon/choix librairie, tri, responsive mobile
- Boutures : CRUD complet, filtres difficulté/choix librairie, tri, responsive mobile
- Avis : modération (approuver, masquer), tri par date/note/type
- Événements : CRUD complet, distinction passé/à venir, responsive mobile
- Sélections : CRUD, drag-and-drop pour l'ordre (sélections et items), visibilité publique/privée
- Navigation admin : burger menu mobile, sidebar desktop

### Front public — fait (v1)

- Page d'accueil
- Catalogue livres avec filtres (genre, rayon) et tri
- Fiche livre avec avis
- Catalogue boutures avec filtres (difficulté) et tri
- Fiche bouture avec avis
- Page "Surprendre" (sélection aléatoire)
- Page événements (`/evenements`) — à venir + passés récents
- Page sélections (`/selections`) — sélections actives du conservateur, items livres + boutures cliquables
- Avis : formulaire de dépôt sur les fiches produit (livres + boutures)
- Navigation publique (Livres, Boutures, Sélections, Événements, Concept, Contact)

---

## Backlog

### Back-office — à faire

- **Google Books API** — ISBN → auto-fill titre / auteur / couverture ([doc](https://developers.google.com/books/docs/v1/using))
- **Upload images boutures** — MinIO ou stockage local
- **RTE** — éditeur rich text pour descriptions ([Tiptap](https://tiptap.dev/))

### Infra — quand nécessaire

- **MinIO** — stockage images boutures (upload admin). Tester l'API leslibraires.fr pour les couvertures livres d'abord.
- **Meilisearch** — quand le catalogue dépasse ~500 entrées ou quand les filtres ne suffisent plus.

### À définir

- Rebrand "newsletter" → terme cohérent avec l'univers librairie
- Choix de la font body
- Contenu pages légales (mentions légales, CGV, CGU, cookies, politique de confidentialité)
- Validation éco-conception : [thegreenwebfoundation.org](https://www.thegreenwebfoundation.org/)
