# TODO

## Public — fait

- [x] `/livres` — catalogue avec FilterBar (rayon, genre, série, éditeur, format, sort, choix)
- [x] `/livres/[slug]` — fiche avec CoverPanel, fiche technique, recos, avis
- [x] `/boutures` — vitrine bento (grande/petite carte alternées, section explicative, sans filterbar)
- [x] `/boutures/[slug]` — fiche avec CoverPanel, conseils entretien, avis
- [x] Images boutures : `public/cuttings/` → assignées par id dans `boutures.json`, fallback couleur par lumière
- [x] Barre de recherche partagée (debounce 350ms, URL params)
- [x] Images livres : next/image + fallback couleur par genre (`--aspect-book`) — une seule image par livre (`image` string, plus tableau)
- [x] Navbar mise à jour (boutures)
- [x] Home `/` — sections livres thématiques + CTA "Me faire surprendre"
- [x] Page `/surprendre` — livre aléatoire parmi `choixLibrairie` + édito libraire
- [x] Contact — form design corrigé + feedback succès/erreur
- [x] Concept — contenu éditorial réel
- [x] Mentions légales + CGV/CGU/cookies/politique (placeholders — contenu à rédiger)
- [x] Formulaire soumission avis (front → modération back-office)
- [x] Open Graph / Satori (`@vercel/og`) — image OG par fiche
- [x] LocalStorage historique visites → recos
- [x] SEO : sitemap.xml (`app/sitemap.ts`), robots.txt (`app/robots.ts`)

## Back-office — fait

- [x] Modération avis — 3 états (en attente / visible / masqué), valider/masquer/supprimer
- [x] Dashboard — stats livres, boutures, avis en attente (accent rouge si > 0)
- [x] Livres — liste avec tri (récents / titre / auteur / prix)
- [x] Boutures — liste avec tri (récentes / nom / prix / difficulté)
- [x] Sélections — liste avec ordre affiché
- [x] "L'avis de la librairie" — `noteDeLaLibrairie` dans JSON + composant `NoteLibrairie` sur fiche livre

## Migration JSON → DB — fait

- [x] `lib/queries/livres.ts` — queries publiques front avec `unstable_cache` (getLivresPubliques, getLivreBySlug, getLivresMisEnAvant, getLivresSeries, getLivresEditeurs, getLivresFormats, getGenresActifs, getLivresRayons)
- [x] `lib/queries/boutures.ts` — queries publiques front avec `unstable_cache` (getBouturesPubliques, getBoutureBySlug)
- [x] `lib/queries/genres.ts`, `lib/queries/rayons.ts`, `lib/queries/recommendations.ts`
- [x] Brancher `/` home sur DB
- [x] Brancher `/livres` + FilterBar sur DB
- [x] Brancher `/livres/[slug]` + OG image sur DB
- [x] Brancher `/boutures` sur DB
- [x] Brancher `/boutures/[slug]` + OG image sur DB
- [x] Brancher `/surprendre` sur DB
- [x] Brancher `sitemap.ts` sur DB
- [x] `lib/data.ts` — réduit aux helpers purs (couleurs, labels) — types et data functions supprimés

## Back-office — fait

- [x] CRUD genres (`/admin/genres`) — liste, créer, modifier, supprimer + `lib/actions/genres.ts`
- [x] CRUD rayons (`/admin/rayons`) — liste, créer, modifier, supprimer + `lib/actions/rayons.ts`
- [x] Genres + rayons dans la nav admin
- [x] RTE (Tiptap) — pages éditoriales (concept, mentions légales, CGV, CGU, cookies, politique) gérables depuis `/admin/pages`
- [x] Pages édito BO — titre cliquable → ouvre la page front dans un nouvel onglet
- [x] Pages édito BO — dirty state sur les boutons Enregistrer / Annuler (inactif si aucun changement)
- [x] Pages édito BO — toggle publiée/privée par ligne (publiee boolean en DB, filtre front)
- [x] Événements — état "en cours" pour les événements avec `dateFin` future + badge visuel
- [x] Événements BO — filtre par état (tous / à venir / en cours / passés) + tri date + toggle publié/privé
- [x] Home — section événement mis en avant (en cours en priorité, sinon prochain)
- [x] Avis BO — toggle "Visible/Masqué" style pill (comme sélections)
- [x] 404 + 500 custom — dans le thème herbier, sobres et élégantes
- [x] Fonts — Raleway pour tout le site, Dancing Script pour `font-manuscript` (note de la librairie)
- [x] Formulaire livre — "Sélection librairie" : section repliable, `choixLibrairie` et `noteDeLaLibrairie` indépendants
- [x] Footer — redesign : manifeste en serif italic display + grille 4 colonnes (Explorer / Boutique / Légal)
- [x] Logo `leb-nobg.png` — intégré nav + footer (next/image, h-10 nav / h-12 footer)
- [x] Navbar — burger menu responsive mobile (animation 3 barres → X, menu overlay absolu)
- [x] `/evenements` front — agenda public (en cours / à venir / passés), filtre publie=true
- [x] `/selections` front — sélections actives du conservateur
- [x] Contact — section "Nous trouver" : adresse + carte Leaflet (react-leaflet v5, tuiles CartoDB light, import dynamique SSR:false)

## Infra — fait

- [x] PostgreSQL (Drizzle ORM) — table `avis` avec `produitNom` (dénormalisé) + `masque` (3 états : en attente / visible / masqué)
- [x] `lib/db/avis.ts` — `getAvisForLivre`/`getAvisForBouture` via `unstable_cache` + tag `avis`
- [x] `POST /api/avis` — validation + écriture en DB (status `pending`)
- [x] Seed avis.json → DB (5 avis approved)

## Templatisation — à faire

- [ ] `lib/config.ts` — `storeConfig` centralisé, lit depuis `NEXT_PUBLIC_STORE_*` avec fallbacks
- [ ] `lib/metadata.ts` — `siteConfig` devient alias de `storeConfig`
- [ ] Tagline footer + hero + concept — remplacer les literals par `siteConfig.tagline`
- [ ] Adresse + coordonnées carte + horaires contact — lire depuis `storeConfig`
- [ ] Email subject Resend — lire depuis `storeConfig.name`
- [ ] AdminShell + login admin — `Lecture & Boutures` → `siteConfig.name`
- [ ] OG images (root, livres/slug, boutures/slug) — nom codé en dur → `siteConfig.name`
- [ ] `.env.local` + README — documenter les vars `NEXT_PUBLIC_STORE_*`

## Infra — plus tard

- [ ] MinIO — stockage images boutures (tester leslibraires.fr API d'abord)
- [ ] Meilisearch — quand catalogue > ~500 entrées

## À définir

- [ ] Rebrand "newsletter"
- [ ] Éco-conception (thegreenwebfoundation.org)
- [ ] Intégration API leslibraires.fr (stocks / panier) / Google books — voir alternatives et prix
- [ ] Infinite scroll sur /livres et /boutures
- [ ] Formbricks — surveys
- [ ] Recherche par titre : autocomplete (titre + auteur + éditeur + année) → préremplissage formulaire livre
- [ ] Saisie ISBN → préremplissage complet formulaire livre
- [ ] Prévisualisation pages éditoriales (sécurisation via token)
- [ ] Pouvoir modifier les horaires / jours d'ouvertures de la boutique via le back office, et potentiellement des jours fermés exceptionnelement.
