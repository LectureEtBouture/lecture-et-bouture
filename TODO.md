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
- [x] Recherche assistée — import livres depuis inventaire.io avec préremplissage formulaire
    - [x] Phase 1 : adapter pattern `lib/services/books/` (providers inventaire + wikidata), Route Handler `/api/books/isbn`, script CLI `scripts/isbn-test.ts`
    - [x] Phase 1b : description via Open Library + traduction LibreTranslate (EN→FR), `lib/services/libretranslate.ts`
    - [x] Phase 2 : intégration UI dans `LivreFormIdentite` — bouton "Importer depuis ISBN" + recherche titre/auteur sur inventaire
    - [x] Phase 3 : colonne `inventaire_uri` sur `livres` (traçabilité, migration)
- [x] Newsletter — Loops, `lib/actions/newsletter.ts` + `NewsletterForm` + `NewsletterSection`, intégré dans Footer
- [ ] Formbricks — vérifier trigger survey (action key `"test"` → enquête s'ouvre)
- [~] Meilisearch — obsolète : recherche déléguée à Google Books API, catalogue DB = enrichissements uniquement
- [ ] Éco-conception — audit thegreenwebfoundation.org

## Pivot architecture livres — API externe comme source de vérité

> Modèle : API externe = catalogue complet. DB locale = couche enrichissement (note librairie, choix, genres, rayons, avis). Stocks/achat via leslibraires.fr.
> **Décision prise** : migrer vers Google Books API pour le browse/search public. inventaire.io reste pour l'import BO (meilleure qualité de métadonnées FR pour l'enrichissement).

### Phase A — DB : table `livres` → table d'enrichissements ✅

- [x] Supprimer les champs catalogue de `livres` (titre, auteur, isbn, editeur, etc.)
- [x] `inventaire_uri` devient `NOT NULL UNIQUE` — clé de liaison avec l'API externe
- [x] `prix` nullable (indicatif)
- [x] `db/migrate.ts` + `db/schema.ts` + `db/seed.ts` nettoyés (DB fresh)

### Phase B — Service livres : type unifié `LivreComplet` ✅

- [x] `LivreComplet` = métadonnées API + enrichissements locaux optionnels
- [x] `lib/services/books/merge.ts` — `fusionner()` + `fusionnerListe()`
- [x] `lib/services/books/slug.ts` — `uriToSlug()` / `slugToUri()`
- [x] `InventaireProvider` — `rechercherParUri`, `rechercherParUris`, `rechercherParTitre`
- [x] `fetchInvEntities` resilient (warn + return `{}` si inventaire.io down)
- [x] Filtrage des `local:` URIs avant appel inventaire.io

### Phase C — API Routes ✅

- [x] `GET /api/books/search?q=X`
- [x] `GET /api/books/isbn?q=X`
- [x] `GET /api/books/uri?uri=X`

### Phase D — Front `/livres` ✅ (code OK, données vides)

- [x] Browse = enrichissements DB + batch fetch métadonnées
- [x] Search = live API + overlay enrichissements
- [x] FilterBar — rayon/genre/choix/sort
- [x] Infinite scroll
- [x] `/surprendre` — `choixLibrairie` → fetch métadonnées

### Phase E — Front `/livres/[slug]` ✅

- [x] Slug → URI → fetch API → overlay enrichissement
- [x] Prix indicatif, lien leslibraires.fr, note librairie, avis
- [x] `generateStaticParams` supprimé (pages dynamiques)

### Phase F — Back-office livres ✅

- [x] Formulaire enrichissement (inventaireUri + note/choix/rayon/genres/prix)
- [x] Import depuis inventaire.io via TitreAuteurSearch / ISBNImportRow
- [x] `use server` re-export bug fixé (`livres-meta.ts`)

### Phase G — Avis + Sélections ✅

- [x] `POST /api/avis` — `itemId = inventaireUri`, auto-crée enrichissement si besoin
- [x] `selection_items` — FK `livre_id uuid` (livres enrichis uniquement)

### Phase H — Google Books comme source principale ✅

> **Objectif** : afficher des livres sur la home et `/livres` dès le premier lancement, sans dépendre de la couverture limitée d'inventaire.io. inventaire.io reste pour l'import BO uniquement.

- [x] `lib/services/books/providers/google-books.ts` — `GoogleBooksProvider` implémentant `BookProvider`
- [x] `lib/services/books/providers/google-books-helpers.ts` — mapping `VolumeInfo` → `LivreMetadata`
- [x] `lib/services/books/index.ts` — `bookProvider` public → `GoogleBooksProvider` ; `importProvider` → `InventaireProvider` (BO)
- [x] `GET /api/books/isbn` — utilise `importProvider` (inventaire.io, qualité FR pour import BO)
- [x] `GET /api/books/search` — utilise `bookProvider` (Google Books, recherche publique + BO titre/auteur)
- [x] `uriToSlug` / `slugToUri` — inchangés (format `isbn:XXX` identique)
- [x] `GOOGLE_BOOKS_API_KEY` — documenté dans `.env.example`
- [x] Discovery sections Tendances + Nouveautés sur `/livres` (Google Books `orderBy=newest/relevance`)
- [x] Infinite scroll découverte via `startIndex` — `DiscoverySection` client component
- [x] Sorts contextuels : découverte (caché), recherche (relevance/newest), catalogue (alpha/date/note/prix)
- [x] `/livres/gbid-XXX` — routing `gbid:` URI corrigé dans `slugToUri`
- [x] Couvertures Open Library comme fallback quand Google Books n'a pas de thumbnail
- [x] Description Open Library (`fetchOLDescriptionByISBN`) en fallback sur fiche livre

### Phase I — Refonte affichage livres (en cours)

> **Objectif** : home = parcours éditorial cohérent (choix → nouveautés → tendances → genres). `/livres` défaut = même logique avec infinite scroll. Liens "Voir plus" pré-chargent les bons filtres.

#### Docs API utiles
- Google Books Volumes.list : https://developers.google.com/books/docs/v1/reference/volumes/list?hl=fr
- Open Library Books API : https://openlibrary.org/dev/docs/api#anchor_booksearch
- Open Library Covers API : https://openlibrary.org/dev/docs/api#anchor_covers

#### Home `/`
- [x] Reorder sections : Choix de la librairie → Nouveautés → Tendances → Sections par genre
- [x] Sections Nouveautés + Tendances depuis Google Books
- [x] Sections par genre : `rechercherParSujet` + requêtes Google Books fixes (Imaginaire + Sciences & Nature)
- [x] "Voir plus" liens corrigés : Nouveautés → `/livres?sort=newest`, Tendances → `/livres?sort=relevance`, Choix → `/livres?choix=1`, Genre → `/livres?q=...`

#### `/livres` — vue par défaut
- [x] Ordre cible : Choix de la librairie → Tendances → Nouveautés
- [x] Infinite scroll `DiscoverySection` (`startIndex`) opérationnel
- [x] Infinite scroll search (`LivresGrid`) : batches de 8, `startIndex` passé via `filters.offset`
- [x] `isFrench` filter : discovery seulement, pas sur search explicite

### Phase J — Enrichissement données Google Books
> **Objectif** : exploiter les champs supplémentaires de l'API Google Books (catégories, prix ebook, preview, pages) + sanitizer les descriptions HTML.

#### Docs
- Google Books Volume resource : https://developers.google.com/books/docs/v1/reference/volumes?hl=fr
- Google Books BISAC categories : pas d'endpoint liste — catégories extraites des réponses, format "Fiction / Fantasy / General"
- sanitize-html : https://www.npmjs.com/package/sanitize-html (déjà installé pour pages éditoriales)

#### Nouveaux champs à mapper (LivreMetadata + LivreComplet)
- [x] `categories: string[]` — volumeInfo.categories (BISAC, ex: "Fiction / Fantasy / General")
- [x] `previewLink: string | null` — volumeInfo.previewLink (lien lecteur Google Books)
- [x] `isEbook: boolean` — saleInfo.isEbook
- [x] `prixNumerique: number | null` — saleInfo.retailPrice.amount (EUR, ebook Google Play)
- [x] `nombrePages: number | null` — volumeInfo.printedPageCount ?? volumeInfo.pageCount

#### Description HTML
- [x] `description` contient du HTML brut (p, b, br) — sanitizé via `sanitizeRte` (sanitize-html, pattern pages éditoriales)
- [x] Rendu HTML sanitizé sur /livres/[slug]

#### Filtres par catégorie BISAC
- [x] Mapper les 15 rayons DB vers sujets BISAC — `lib/services/books/bisac.ts`
- [x] URL rayon : UUID → slug (`?rayon=imaginaire` au lieu de UUID)
- [x] `getLivresSearch` injecte le sujet BISAC dans la query quand `rayonSlug` présent

#### Affichage fiche livre (/livres/[slug])
- [x] Badge "Disponible en ebook" si isEbook
- [x] Prix numérique affiché si présent (fiche technique CoverPanel)
- [x] Lien "Aperçu Google Books" → previewLink (nouvel onglet)
- [x] Nombre de pages dans la fiche technique
- [x] Catégories BISAC affichées en tags sous la description

### Phase K — Back-office livres : Google Books intégration

> **Objectif** : l'admin peut chercher n'importe quel livre depuis Google Books directement dans le BO, sélectionner un résultat et créer l'enrichissement en un clic. La liste BO affiche le titre/auteur réel au lieu de l'URI brute.

#### Docs
- Google Books Volumes.list : https://developers.google.com/books/docs/v1/reference/volumes/list?hl=fr
- GET /api/books/search?q= — route existante, utilise `bookProvider` (Google Books)

#### Liste `/admin/livres`
- [x] Enrichir la liste avec titre + couverture via `rechercherParUris` (batch)
- [x] Afficher titre + couverture dans la table, URI visible en mono en dessous
- [x] Page modifier — heading affiche le titre du livre au lieu de l'URI (stored titre ou fallback URI)
- [ ] Recherche BO : chercher par titre/auteur sur Google Books en plus du filtre URI local

#### Nouveau livre — Google Books search
- [x] `TitreAuteurSearch` : champ titre/auteur → Google Books → dropdown résultats avec couverture
- [x] Sélection → pré-remplit `inventaireUri` + aperçu livre (titre + couverture + auteur)
- [x] Import ISBN inventaire.io conservé pour qualité FR des métadonnées
- [ ] Conserver import ISBN inventaire.io en fallback uniquement (actuellement les deux coexistent)

### Phase L — Qualité catalogue & UX (fait)

- [x] Toggle ebook (`?ebook=1`, défaut off) — front `/livres` toutes vues + admin `TitreAuteurSearch`
- [x] `publishedDateRaw` + formatage date dd/mm/yyyy sur fiche livre
- [x] Champ `language` mappé depuis Google Books — masque descriptions non-FR ou < 20 chars
- [x] Sections recos fiche livre : "Du même auteur" (`inauthor:"X"`) + "Dans le même univers" (BISAC rayon)
- [x] Avis déplacés avant les sections recos sur fiche livre
- [x] Expansion auteur automatique dans `getLivresSearch` : < 4 résultats physiques même auteur → `inauthor:"X"` en complément
- [x] Sort toujours visible dans FilterBar (SORTS_CATALOGUE hors search, SORTS_SEARCH si `?q=`)
- [x] `rechercherParTitre` : `maxResults` configurable (8 défaut admin, 40 front search)
- [x] `langRestrict` retiré des méthodes discovery — requêtes françaises assurent la pertinence
- [x] `buildUrl` : paramètre `langRestrict = true` — discovery passe `false`
- [x] Bouton "Charger plus" fallback infinite scroll (LivresGrid + DiscoverySection)
- [x] Offset API correct : multiples de 40 pour cat browse + discovery (évite les slices chevauchantes)
- [x] `hasMore` cat browse : `initialItems.length > 0` au lieu de `filteredCount === pageSize`
- [x] Clés React dédupliquées : `${inventaireUri}-${index}` dans toutes les grilles
- [x] Lien "Vous ne trouvez pas ?" → leslibraires.fr en bas de `/livres`
- [x] Admin avis : LEFT JOIN livres → `inventaireUri`, batch fetch titre + couverture Google Books, lien vers fiche front
- [x] Admin livres : batch fetch titre + couverture dans la liste via `rechercherParUris`
- [x] `produitNom` renseigné à l'insert avis (= `itemId` / inventaireUri)
- [x] `validerAvis`/`masquerAvis`/etc : `updateTag` → `revalidateTag('avis', 'max')` (unstable_cache invalide correctement)
- [x] BISAC `bisac.ts` : termes descriptifs français au lieu d'opérateurs `subject:` anglais
- [x] Catégories exotiques ajoutées au MAP FR : Marvelous, Supernatural, Paranormal, Occult, Magic, Fairy Tales
- [x] `suggestRayonSlug` étendu : marvelous, supernatural, paranormal, occult, magic, fairy, dragon, vampire, sorcier → imaginaire

### Phase M — Form qualité & cohérence (fait)

- [x] Lien auteur fiche livre → `inauthor:"X"` harmonisé dans LivreHeader (était plain text, RecoSection avait déjà le bon format)
- [x] Import ISBN : appel Google Books en parallèle pour merger les catégories BISAC → rayon auto-suggéré
- [x] `suggestGenreIds` dans `categories-fr.ts` — match BISAC traduits → genres DB par substring
- [x] Checkboxes genres : `defaultChecked` (uncontrolled) → `checked`/`onChange` (controlled), pré-cochées à l'import
- [x] `titre` stocké en DB — colonne `livres.titre text`, sauvegardé via hidden input form, affiché dans liste BO et heading modifier (fallback URI si NULL)
- [x] Prix form : hint corrigé ("Prix physique indicatif — à renseigner manuellement")
