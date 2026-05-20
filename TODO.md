# TODO

## Public — fait

- [x] `/livres` — catalogue avec FilterBar (rayon, genre, série, éditeur, format, sort, choix)
- [x] `/livres/[slug]` — fiche avec CoverPanel, fiche technique, recos, avis
- [x] `/boutures` — vitrine bento (grande/petite carte alternées, section explicative, sans filterbar)
- [x] `/boutures/[slug]` — fiche avec CoverPanel, conseils entretien, avis
- [x] Barre de recherche partagée (debounce 350ms, URL params)
- [x] Images livres : next/image + fallback couleur par genre — une seule image par livre
- [x] Navbar mise à jour (boutures) + burger menu responsive mobile
- [x] Home `/` — sections livres thématiques + CTA "Me faire surprendre"
- [x] Page `/surprendre` — livre aléatoire parmi `choixLibrairie` + édito libraire
- [x] Contact — form + feedback succès/erreur + section "Nous trouver" (Leaflet, CartoDB light)
- [x] Concept — contenu éditorial réel
- [x] Mentions légales + CGV/CGU/cookies/politique (placeholders)
- [x] Formulaire soumission avis (front → modération back-office)
- [x] Open Graph / Satori (`@vercel/og`) — image OG par fiche
- [x] LocalStorage historique visites → recos
- [x] SEO : sitemap.xml, robots.txt (branchés sur DB)
- [x] `/evenements` — agenda public (en cours / à venir / passés), multi-jours, `EvenementEnAvant`
- [x] `/selections` — sélections actives du conservateur
- [x] Infinite scroll sur `/livres` et `/boutures`
- [x] Prévisualisation pages éditoriales — Draft Mode Next.js, `PreviewBanner`, bouton "Aperçu ↗" BO
- [x] 404 + 500 custom — thème herbier
- [x] Fonts — Raleway + Dancing Script (`font-manuscript`)
- [x] Footer — redesign manifeste serif italic + grille 4 colonnes
- [x] Logo `leb-nobg.png` — nav + footer
- [x] Nav + Footer — liens pages éditoriales masqués si `publiee = false`
- [x] Fermetures exceptionnelles — affichées front (contact + footer) via `HorairesDisplay`

## Back-office — fait

- [x] Dashboard — stats livres, boutures, avis en attente + cards "À traiter"
- [x] Livres — liste (tri, searchbar), CRUD complet, formulaire avec sélection librairie repliable
- [x] Boutures — liste (tri), CRUD complet
- [x] Genres + Rayons — CRUD + nav admin
- [x] Avis — modération 3 états (en attente / visible / masqué), toggle pill
- [x] Sélections — liste avec ordre, CRUD
- [x] Événements — liste, CRUD, filtre état, toggle publié/privé, badge "en cours"
- [x] Pages éditoriales — RTE Tiptap, dirty state, toggle publiée/privée, titre cliquable vers front
- [x] Paramètres — table `parametres` (horaires, fermetures, annonce, maintenance, réseaux sociaux), UX dirty state + auto-dismiss + delete confirm inline, `ParametresNav` sticky (scroll listener + click-lock 700ms, couvre sections sans assez de contenu sous elles)
- [x] AdminShell — sidebar sticky (`h-screen`), logout toujours visible, section "Administration" délimitée (Paramètres / Utilisateurs / Journaux), lien "↗ Site"
- [x] Utilisateurs — CRUD complet (`/admin/users`), rôles filtrés par acteur, guard dernier super_admin
- [x] Reset password — self-service (`/admin/forgot-password`, `/admin/reset-password`) + admin-initiated depuis liste users, email Resend
- [x] Journaux — page `/admin/logs`, FIFO 200, badge action coloré, guard `super_admin`

## Infra — fait

- [x] PostgreSQL (Drizzle ORM) — schéma complet, migrations idempotentes (`db/migrate.ts`)
- [x] UUID PKs sur toutes les tables
- [x] MinIO — Docker Compose (ports 9100/9101), upload API, `ImageUpload` component, `next.config.ts` remotePatterns dynamique depuis `MINIO_PUBLIC_URL`
- [x] `next/image` partout — `<img>` plain remplacé sauf preview admin (`ImageUpload`)
- [x] Seed complet (`db/seed.ts`) avec Maps UUID cross-références

## Templatisation — fait

- [x] `lib/config.ts` — `storeConfig` centralisé (`NEXT_PUBLIC_STORE_*`)
- [x] `lib/metadata.ts` — `siteConfig` alias de `storeConfig`
- [x] Tous les literals de marque remplacés (tagline, adresse, coordonnées, email subjects, OG images, AdminShell)
- [x] `.env.local` — vars `NEXT_PUBLIC_STORE_*` documentées

## Auth & Utilisateurs — fait

### Phase 1 — Table `users`

- [x] Enum PostgreSQL `role_utilisateur` : `super_admin | admin | editor | moderator | contributor`
- [x] Rename `admin_users` → `users`, PK serial → uuid, colonnes `role`, `updated_at`, `reset_token`, `reset_token_expires_at`
- [x] `auth.ts` + `auth.config.ts` — JWT/session propagent `id` (uuid) + `role`
- [x] `types/next-auth.d.ts` — augmentation Session + JWT + User
- [x] `scripts/create-admin.ts` — rôle `super_admin` par défaut

### Phase 2 — UUID toutes tables

- [x] PKs serial → uuid sur toutes les tables + FKs `livres_genres`
- [x] Queries/actions mises à jour (params route → string uuid)

### Phase 3 — Logs admin

- [x] Table `admin_logs` — `user_id uuid NULL FK ON DELETE SET NULL` (anonymisation), `user_email` dénormalisé
- [x] FIFO 200 dans `createLog`, branché sur tous les modules

### Phase 4 — CRUD users + rôles + reset password

- [x] `lib/actions/users.ts` — `getUsers`, `createUser`, `updateUser`, `deleteUser`, `initiatePasswordReset`, `forgotPassword`, `resetPassword`
- [x] Rôles : matrice complète dans `ROLES.md`, `contributor` = editor + moderator combinés
- [x] Pages BO : liste, nouveau, modifier (sélecteur rôles filtré par acteur)
- [x] Auth fixes : `session.user.id` propagé depuis `token.sub` ; routes `/forgot-password` + `/reset-password` whitelistées dans middleware

## À faire

- [x] QR code — section dans `/admin/parametres`, URL éditable (préchargée depuis `storeConfig.url`), preview temps réel, téléchargement PNG + SVG
- [ ] Recherche assistée — import livres depuis inventaire.io avec préremplissage formulaire
    - [x] Phase 1 : adapter pattern `lib/services/books/` (providers inventaire + wikidata), Route Handler `/api/books/isbn`, script CLI `scripts/isbn-test.ts`
    - [x] Phase 1b : description via Open Library + traduction LibreTranslate (EN→FR), `lib/services/libretranslate.ts`
    - [ ] Phase 2 : intégration UI dans `LivreFormIdentite` — bouton "Importer depuis ISBN" + recherche titre/auteur sur inventaire
    - [ ] Phase 3 : colonne `inventaire_uri` sur `livres` (traçabilité, migration)
- [ ] Formbricks — vérifier trigger survey (action key `"test"` → enquête s'ouvre)
- [ ] Meilisearch — quand catalogue > ~500 entrées
- [ ] API leslibraires.fr (stocks / panier) — évaluer alternatives + prix
- [x] Newsletter — Loops, `lib/actions/newsletter.ts` + `NewsletterForm` + `NewsletterSection`, intégré dans Footer
- [ ] Éco-conception — audit thegreenwebfoundation.org
- [ ] Lien pour les livres / stocks / paiements / commandes avec https://2dcom.fr/produits/librisoft/ Librisoft et leslibraires.fr.
