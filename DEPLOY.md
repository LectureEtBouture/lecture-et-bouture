# Déploiement — Lecture & Bouture

## Prérequis

### Machine de build (dev)

- Docker installé et fonctionnel
- Compte Docker Hub : `sankarej`
- Connecté : `docker login`

### Serveur cible

- Linux (Ubuntu 22.04+ recommandé)
- Docker + Docker Compose v2
- Ports ouverts : `80`, `443`, `3000` (app), `9100/9101` (MinIO)
- Accès SSH

---

## 1. Build & push (depuis dev)

> **WSL2** : si erreur DNS dans le build, fixer d'abord :
>
> ```bash
> sudo mkdir -p /etc/docker
> sudo tee /etc/docker/daemon.json > /dev/null <<'EOF'
> { "dns": ["8.8.8.8", "8.8.4.4"] }
> EOF
> sudo service docker restart
> ```

```bash
docker build -t sankarej/lecture-et-bouture:latest .
docker push sankarej/lecture-et-bouture:latest
```

Tag versionné (recommandé) :

```bash
docker build -t sankarej/lecture-et-bouture:1.0.0 -t sankarej/lecture-et-bouture:latest .
docker push sankarej/lecture-et-bouture:1.0.0
docker push sankarej/lecture-et-bouture:latest
```

---

## 2. Setup serveur (première fois)

### Installer Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# reconnexion SSH nécessaire
```

### Copier les fichiers de déploiement

```bash
scp docker-compose.yml user@serveur:~/leb/
scp .env.example user@serveur:~/leb/
```

### Configurer l'environnement

```bash
ssh user@serveur
cd ~/leb
cp .env.example .env
nano .env   # remplir toutes les valeurs (voir section Variables)
```

---

## 3. Variables d'environnement (`.env`)

| Variable                        | Obligatoire | Description                                               |
| ------------------------------- | ----------- | --------------------------------------------------------- |
| `AUTH_SECRET`                   | ✓           | `openssl rand -base64 33`                                 |
| `AUTH_URL`                      | ✓           | URL publique de l'app (ex: `https://lectureetbouture.fr`) |
| `NEXTAUTH_URL`                  | ✓           | Idem `AUTH_URL`                                           |
| `DATABASE_URL`                  | auto        | Géré par compose (`leb-db`) — ne pas changer              |
| `MINIO_ACCESS_KEY`              | ✓           | Clé MinIO (choisir au déploiement)                        |
| `MINIO_SECRET_KEY`              | ✓           | Secret MinIO (choisir au déploiement)                     |
| `MINIO_BUCKET`                  | ✓           | `leb` par défaut                                          |
| `RESEND_API_KEY`                | ✓           | Clé API Resend (emails transactionnels)                   |
| `RESEND_FROM_EMAIL`             | ✓           | Expéditeur emails                                         |
| `RESEND_TO_EMAIL`               | ✓           | Destinataire notifications                                |
| `LOOPS_API_KEY`                 | ✓           | Clé API Loops (newsletter)                                |
| `PREVIEW_SECRET`                | ✓           | `openssl rand -base64 20`                                 |
| `GOOGLE_BOOKS_API_KEY`          | ✓           | Google Books API                                          |
| `WIKIDATA_ACCESS_TOKEN`         | —           | Import livres via Wikidata                                |
| `BOOK_IMPORT_PROVIDER`          | —           | `inventaire` (défaut) ou `wikidata`                       |
| `NEXT_PUBLIC_STORE_*`           | ✓           | Infos boutique affichées publiquement                     |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID`  | —           | Analytics Umami                                           |
| `NEXT_PUBLIC_FORMBRICKS_ENV_ID` | —           | Surveys Formbricks                                        |
| `DOCKER_IMAGE`                  | —           | `sankarej/lecture-et-bouture:latest`                      |

> `DATABASE_URL`, `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL` sont **overridés dans docker-compose** — les valeurs dans `.env` pour ces 4 sont ignorées en prod.

> **Déploiement Railway (hors docker-compose)** : `MINIO_ENDPOINT` accepte
> aussi une URL complète (`https://host`) — pratique car les buckets Railway
> exposent leur endpoint sous cette forme (`${{<bucket>.ENDPOINT}}`).
> `lib/minio.ts` détecte le préfixe `http(s)://` et en déduit host/port/SSL
> automatiquement ; sinon `MINIO_PORT`/`MINIO_USE_SSL` sont utilisés tels quels.

---

## 4. Premier démarrage

```bash
cd ~/leb

# Pull toutes les images
docker compose pull

# Démarrer (en arrière-plan)
docker compose up -d

# Vérifier que tout tourne
docker compose ps
docker compose logs app --tail=50
```

### Migrations base de données (première fois uniquement)

```bash
# Depuis la machine de dev, pointer sur la DB du serveur
DATABASE_URL=postgresql://leb:leb@<ip-serveur>:5432/leb npm run db:migrate

# OU via docker exec sur le serveur (si npm dispo dans l'image)
# L'image standalone ne contient pas npm — préférer depuis dev
```

### Créer le bucket MinIO

1. Ouvrir la console MinIO : `http://<ip-serveur>:9101`
2. Login : `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`
3. Créer bucket `leb`

> Le bucket reste **privé**. Les images ne sont jamais servies directement depuis
> MinIO/S3 — elles passent par `/api/images/[...path]` (voir `lib/minio.ts` et
> `app/api/images/[...path]/route.ts`), qui les stream via le client MinIO
> authentifié. Ça évite toute config de policy publique, et ça marche pareil
> sur un MinIO self-hosted ou un bucket managé (ex: Railway Buckets, qui
> n'expose de toute façon aucune policy publique).

### Créer le compte admin

```bash
# Depuis dev, pointer sur la DB du serveur
DATABASE_URL=postgresql://leb:leb@<ip-serveur>:5432/leb npm run admin:create
```

---

## 5. Mise à jour (redéploiement)

```bash
# Dev : build + push
docker build -t sankarej/lecture-et-bouture:latest .
docker push sankarej/lecture-et-bouture:latest

# Serveur : pull + restart
ssh user@serveur
cd ~/leb
docker compose pull app
docker compose up -d app
```

---

## 6. Ports & services

| Service       | Port   | Usage                     |
| ------------- | ------ | ------------------------- |
| App Next.js   | `3000` | Application principale    |
| PostgreSQL    | `5432` | Base de données (interne) |
| MinIO API     | `9100` | Stockage fichiers         |
| MinIO Console | `9101` | Interface admin MinIO     |
| Adminer       | `8080` | Interface admin DB        |
| Portainer     | `9000` | Interface admin Docker    |

> En production, exposer uniquement le port `3000` (et `9100` si MinIO public). Mettre un reverse proxy (Caddy, Nginx) devant.

---

## 7. Reverse proxy (Caddy — recommandé)

Un `Caddyfile` est inclus dans le repo. Adapter les domaines :

```
lectureetbouture.fr {
    reverse_proxy localhost:3000
}

media.lectureetbouture.fr {
    reverse_proxy localhost:9100
}
```

```bash
sudo apt install -y caddy
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

---

## 8. Commandes utiles

```bash
# Logs en temps réel
docker compose logs -f app

# Restart app seulement
docker compose restart app

# Arrêt complet
docker compose down

# Arrêt + suppression volumes (DESTRUCTIF — perd la DB)
docker compose down -v

# Stats ressources
docker stats
```
