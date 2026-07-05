# Rapport de projet — Lecture & Bouture

État des lieux complet du site (2026-07-05). Librairie hybride livres + boutures végétales, Lille.

---

## 1. Vue d'ensemble du site (pages publiques)

| Route                                                                            | Contenu                                                                                                                      |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                                              | Home — choix librairie, nouveautés, tendances, sections genres, boutures, événement en avant, blog en avant, "Surprends-moi" |
| `/livres`                                                                        | Catalogue livres — 4 modes : découverte, catalogue filtré (rayon/genre/choix), recherche, browse par catégorie BISAC         |
| `/livres/[slug]`                                                                 | Fiche livre — couverture, prix, description, avis, recos ("même genre", "même auteur", "même univers")                       |
| `/boutures`                                                                      | Catalogue boutures (grille bento)                                                                                            |
| `/boutures/[slug]`                                                               | Fiche bouture — description, conseils d'entretien, avis                                                                      |
| `/selections`                                                                    | Sélections curatées par la librairie (mix livres + boutures)                                                                 |
| `/evenements`                                                                    | Agenda librairie                                                                                                             |
| `/evenements/[id]`                                                               | Détail événement                                                                                                             |
| `/blog`                                                                          | Articles, filtrable par catégorie et tag, flux RSS (`/blog/feed.xml`)                                                        |
| `/blog/[slug]`                                                                   | Article — tags, articles liés, avis                                                                                          |
| `/surprendre`                                                                    | Tirage aléatoire (livre ou bouture)                                                                                          |
| `/ma-liste`                                                                      | Liste de souhaits (localStorage) + demande de disponibilité groupée                                                          |
| `/concept`                                                                       | Page éditoriale (contenu géré depuis le BO)                                                                                  |
| `/contact`                                                                       | Formulaire de contact                                                                                                        |
| `/cgu`, `/cgv`, `/mentions-legales`, `/politique-de-confidentialite`, `/cookies` | Pages légales (éditoriales, éditables en BO)                                                                                 |

**Pas de panier ni paiement en ligne** — le modèle est catalogue + prise de contact (email) pour vérifier une disponibilité en boutique.

---

## 2. Palette de couleurs (front)

Tokens Tailwind définis dans `app/globals.css`, jamais de hex en dur dans les classes :

| Token           | Valeur                | Usage                              |
| --------------- | --------------------- | ---------------------------------- |
| `primary`       | `#2d4b3e`             | vert profond, couleur de marque    |
| `primary-light` | `#3d6354`             | variante hover/accent              |
| `background`    | `#f5f4ef`             | fond crème                         |
| `foreground`    | `#1a1a1a`             | texte principal                    |
| `muted`         | `#8a9e95`             | texte secondaire, vert grisé       |
| `border`        | `#d6d3c8`             | bordures                           |
| `surface`       | `#ffffff`             | cartes, fonds blancs               |
| `note`          | `#fdf9f2`             | fond encart "note de la librairie" |
| `danger`        | `oklch(0.48 0.16 25)` | erreurs                            |

Typographies : **Raleway** (sans, UI), **Noto Serif** (titres), **Dancing Script** (`--font-manuscript`, note manuscrite librairie).

Exception documentée : couleurs calculées au runtime (cover colors par genre/luminosité) restent en `style={{}}` inline.

---

## 3. Ce que les visiteurs peuvent faire

- **Parcourir** livres (catalogue Google Books + enrichissement local) et boutures, filtrer par rayon/genre/difficulté/lumière, trier, rechercher.
- **Déposer un avis** (livre, bouture, article) — modéré avant publication, honeypot + Altcha anti-spam.
- **Liste de souhaits** (`/ma-liste`, localStorage, pas de compte requis) — cœur sur la fiche, badge nav.
- **Demander une disponibilité** — depuis `/ma-liste`, formulaire groupé (nom/prénom/email/tél) envoyé par email à la librairie ; déclenche une notification "nudge" temps réel (SSE) aux autres visiteurs ("X vient de s'intéresser à ce livre").
- **S'abonner à la newsletter** — double stockage : Loops (envoi) + table locale `newsletter_subscribers`.
- **Partager une fiche** (`navigator.share()` natif ou copie de lien).
- **Contacter la librairie** (formulaire `/contact`, anti-spam).
- **S'inspirer** via "Surprends-moi" (tirage aléatoire livre/bouture) et les sélections curatées.
- **Suivre l'agenda** des événements et lire le blog (RSS disponible).
- **Prévisualiser un contenu non publié** si lien de preview partagé par l'admin (Draft Mode).

---

## 4. L'espace administration (back-office)

Accès `/admin`, protégé par session (iron-session), layout dédié avec sidebar filtrée par rôle.

| Section               | Rôle                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Dashboard**         | Vue d'ensemble, horloge live                                                                                                 |
| **Livres**            | CRUD enrichissement, recherche/import Google Books par ISBN ou titre, suggestion rayon/prix/catégories à l'import            |
| **Boutures**          | CRUD catalogue complet (stock, difficulté, lumière, arrosage)                                                                |
| **Genres / Rayons**   | Taxonomies de navigation                                                                                                     |
| **Événements**        | Agenda, mise en avant                                                                                                        |
| **Sélections**        | Listes curatées (drag & drop via dnd-kit), publication indépendante                                                          |
| **Blog**              | Articles (éditeur Tiptap), catégories, tags, auteurs (champ libre + suggestions), diffusion par email aux abonnés newsletter |
| **Avis**              | Modération (valider/masquer/supprimer), tous types confondus                                                                 |
| **Newsletter**        | Liste des abonnés, tri par date                                                                                              |
| **Pages éditoriales** | Contenu des pages légales/concept, avec preview Draft Mode                                                                   |
| **Paramètres**        | Horaires, fermetures exceptionnelles, bandeau d'annonce, mode maintenance, réseaux sociaux, QR code (export PNG/SVG)         |
| **Stockage**          | Vue du bucket MinIO — fichiers, quota utilisé (super_admin + admin)                                                          |
| **Utilisateurs**      | Gestion des comptes BO (super_admin + admin)                                                                                 |
| **Journaux**          | Historique des actions (super_admin uniquement)                                                                              |

Widgets transverses : bouton de feedback dev flottant (envoie un email au développeur), bandeau de preview si Draft Mode actif.

---

## 5. Comptes depuis le BO — ce qu'il est possible de faire

Page `/admin/users` (accès super_admin + admin) :

- **Créer** un compte (email + mot de passe, rôle assignable selon le rôle du créateur).
- **Modifier** un compte (email, rôle).
- **Réinitialiser le mot de passe** d'un utilisateur (génère un token, envoie un email via Resend — flow admin-initiated, distinct du "mot de passe oublié" self-service).
- **Supprimer** un compte — garde-fou : impossible de supprimer le dernier `super_admin`.
- **Filtrage** : un `admin` ne voit ni ne peut cibler les comptes `super_admin`.
- **Élévation de rôle bloquée côté serveur** : un `admin` ne peut pas s'auto-promouvoir ni créer/promouvoir en `admin` ou `super_admin`.

Chaque action sensible (création, modification, suppression, contenu) est tracée dans `admin_logs` (200 dernières entrées, FIFO), avec email dénormalisé pour rester lisible même si le compte est supprimé.

---

## 6. Rôles et droits

5 rôles (`role_utilisateur` enum PostgreSQL) :

| Rôle          | Portée                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| `super_admin` | Accès total : contenu, utilisateurs (tous rôles), journaux, stockage                                    |
| `admin`       | Contenu total + gestion des users editor/moderator/contributor, stockage                                |
| `editor`      | Création/édition de tout le contenu (livres, boutures, blog, événements, sélections, pages, paramètres) |
| `moderator`   | Modération des avis uniquement (valider/masquer/supprimer)                                              |
| `contributor` | `editor` + `moderator` combinés — contenu et modération, sans accès users/journaux                      |

Détail complet dans `ROLES.md`. Guards techniques notables : dernier `super_admin` protégé de la suppression, un `admin` ne peut pas s'élever ni élever quelqu'un au-delà de son propre niveau.

---

## 7. Stack technique

> Précision : le projet est en **Next.js 16** (App Router), pas NestJS — il n'y a pas de serveur API séparé, la logique back vit dans les Server Actions / Route Handlers Next.js.

| Domaine                              | Techno                                                                                                           | Détail                                                                                                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                            | **Next.js 16.2.6** (App Router, React 19.2)                                                                      | Server Components par défaut, cache "ancien modèle" (pas de `cacheComponents`)                                                                                                      |
| Langage                              | TypeScript                                                                                                       | strict                                                                                                                                                                              |
| Styles                               | **Tailwind CSS v4**                                                                                              | tokens custom, pas de hex en dur                                                                                                                                                    |
| Base de données                      | **PostgreSQL 16**                                                                                                | via Docker Compose (dev) ou managé (prod)                                                                                                                                           |
| ORM                                  | **Drizzle ORM** (`^0.45`) + `drizzle-kit`                                                                        | migrations SQL brut idempotentes, PKs uuid partout                                                                                                                                  |
| Auth BO                              | **iron-session** (cookie chiffré `leb-session`)                                                                  | pas de NextAuth malgré des variables d'env historiques (`AUTH_SECRET`, `NEXTAUTH_URL`) encore présentes mais non utilisées par le code d'auth actuel                                |
| Mots de passe                        | **Argon2id** (`argon2`)                                                                                          | hashing                                                                                                                                                                             |
| Éditeur riche                        | **Tiptap v3** (+ extensions table, highlight, mention, drag-handle)                                              | contenu HTML sanitisé (`sanitize-html`) pour livres, boutures, blog, pages éditoriales                                                                                              |
| Stockage fichiers                    | **MinIO** (S3-compatible) — bucket hébergé sur **Railway** en prod                                               | uploads images (couvertures livres/boutures, événements, blog), resize + conversion WebP via `sharp`, servi via proxy `/api/images/[...path]` (bucket privé, jamais d'accès direct) |
| Email transactionnel                 | **Resend**                                                                                                       | reset mot de passe, contact, demande de disponibilité, diffusion newsletter par article                                                                                             |
| Newsletter (liste + envoi marketing) | **Loops**                                                                                                        | inscription contact ; table locale `newsletter_subscribers` en doublon pour la diffusion interne (Resend)                                                                           |
| Anti-spam                            | **Altcha** (self-hosted, `altcha-lib`) + honeypots                                                               | pas de reCAPTCHA (évite le partage de données avec Google / consentement RGPD) — décision documentée                                                                                |
| Analytics                            | **Umami Cloud**                                                                                                  | script chargé conditionnellement (`NEXT_PUBLIC_UMAMI_WEBSITE_ID`)                                                                                                                   |
| Catalogue livres (source de vérité)  | **Google Books API**                                                                                             | recherche, découverte, import ISBN ; `inventaire.io`/Wikidata disponibles en provider alternatif (`BOOK_IMPORT_PROVIDER`)                                                           |
| Cartes                               | **Leaflet / react-leaflet**                                                                                      | localisation boutique                                                                                                                                                               |
| Drag & drop                          | **dnd-kit**                                                                                                      | réordonnancement des sélections en BO                                                                                                                                               |
| Validation                           | **Zod v4**                                                                                                       | schémas formulaires/actions                                                                                                                                                         |
| Notif temps réel                     | SSE maison (`/api/nudge-stream`)                                                                                 | notification "quelqu'un s'intéresse à ce livre" sans service tiers                                                                                                                  |
| Hébergement                          | **Railway** — 3 services : app front (Docker, `railway.toml`, healthcheck `/`), **PostgreSQL**, bucket **MinIO** | Docker Compose + Caddy (`Caddyfile`) restent utilisés en local/dev uniquement                                                                                                       |
| CI locale                            | **Husky** (pre-commit) + ESLint + Prettier                                                                       | formatage automatique, pas de reformattage manuel                                                                                                                                   |

---

## 8. Proposition — synchro stock temps réel via l'API leslibraires.fr

**Quoi :** remplacer la source de vérité catalogue livres (Google Books, générique, pas de notion de stock réel) par le réseau **leslibraires.fr** — API stock/prix temps réel du réseau de librairies indépendantes françaises. Permet dispo garantie + réservation sans paiement anticipé (au lieu de l'email manuel actuel).

**Scope technique :** nouveau provider `LeslibrairesProvider` (implémente déjà l'interface `BookProvider` existante — pattern déjà en place avec Google Books/inventaire.io/Wikidata), mapping ISBN, remplacement progressif du flow `/api/disponibilite` par une vraie vérification stock, cache court (stock volatile), fallback Google Books si item absent du réseau.

### Pour

- Stock réel affiché au visiteur — plus de "peut-être disponible, on vous recontacte", conversion directe.
- Légitimité réseau librairies indépendantes françaises — cohérent avec le positionnement de la marque (vs Amazon/Google générique).
- Couverture ISBN FR meilleure que Google Books (déjà un point de friction actuel, noté en backlog : Google Books strip les tirets ISBN, inventaire.io renvoie 400 sur pas mal d'ISBN FR).
- Architecture prête à recevoir un nouveau provider sans réécrire le reste (`bookProvider`/`importProvider`/`discoveryProvider` déjà abstraits).
- Ouvre la voie à une vraie réservation (sans forcément paiement en ligne) — palier intermédiaire avant un e-commerce complet.

### Contre

- **Coût API/partenariat** — accès à ce type de réseau passe généralement par un contrat commercial (abonnement et/ou commission), pas une API publique gratuite. À chiffrer directement avec leslibraires.fr avant de committer le budget.
- **Dépendance externe forte** — disponibilité/stock devient dépendant de leur uptime et de leurs choix d'API (breaking changes hors de notre contrôle).
- **Couverture non garantie** — tous les ISBN ne sont pas forcément dans leur réseau (petites maisons, occasion, imports) → besoin de fallback Google Books de toute façon, donc double maintenance de deux providers en prod.
- **Latence stock temps réel** — appel externe à chaque consultation fiche ou mise en cache courte à gérer (stock qui change vite = cache agressif inutile, cache large = données fausses).
- **Vendor lock-in** — si le partenariat s'arrête, il faut revenir à Google Books et recommuniquer sur la dispo aux visiteurs.
- **Chantier non trivial** — mapping ISBN + gestion des cas où prix/stock du réseau diffère du prix local saisi en BO (conflit de source de vérité à trancher).

---

_Rapport basé sur l'état du code au 2026-07-05. Sources : `db/schema.ts`/`SCHEMA.md`, `ROLES.md`, `package.json`, `auth.ts`, `lib/session.ts`, `services/`, `.env.example`, structure `app/`._
