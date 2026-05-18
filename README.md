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
