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

### 2. (Première fois) Trusting le certificat Caddy

```bash
docker exec leb-caddy cat /data/caddy/pki/authorities/local/root.crt > /tmp/caddy-root.crt
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain /tmp/caddy-root.crt
```

Redémarre le navigateur après.

### 3. Lancer Next.js

```bash
npm run dev
```

---

## URLs

| Service   | URL                         |
| --------- | --------------------------- |
| App       | https://app.localhost       |
| Adminer   | https://adminer.localhost   |
| Portainer | https://portainer.localhost |

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

## Backlog

### Pages manquantes

- Home (`/`) — sélection conservateur + CTA "Me faire surprendre"
- Page "Me faire surprendre" — livre aléatoire parmi `choixLibrairie`, avec édito du libraire
- Contact, concept, mentions légales

### Front — planifié

- **"L'avis de la librairie"** — champ texte séparé en BDD (≠ avis utilisateurs), affiché en évidence sur la fiche. "Pourquoi on aime ce livre."
- **Open Graph / Satori** — `@vercel/og`, image OG par fiche livre/bouture
- **LocalStorage historique** — tracker livres/boutures visités → alimenter les recommandations
- **SEO** — metadata API Next.js, sitemap.xml, robots.txt, sémantique HTML, audit a11y

### Back-office — planifié

- **Google Books API** — back-office uniquement : ISBN → auto-fill titre / auteur / couverture à la création d'un livre (`https://developers.google.com/books/docs/v1/using`)
- **RTE** — éditeur rich text pour descriptions (`https://tiptap.dev/`)
- **Avis** — formulaire de soumission front → modération back-office

### Infra — quand nécessaire

- **MinIO** — stockage images boutures (upload admin). Priorité : tester l'API leslibraires.fr pour les couvertures livres d'abord. MinIO = S3-compatible, déployable via Docker.
- **Meilisearch** — moteur de recherche (analytics, open source, privacy). À envisager quand le catalogue dépasse ~500 entrées ou quand les filtres JSON ne suffisent plus.

### À définir

- Rebrand "newsletter" → terme cohérent avec l'univers librairie (TBD)
- Choix de la font body (TBD)
- Validation éco-conception : `https://www.thegreenwebfoundation.org/`
