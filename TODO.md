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

## Public — à faire

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

## Back-office — à faire

- [ ] Google Books API — auto-fill ISBN → titre/auteur/couverture (création livre)
- [ ] RTE (Tiptap) — éditeur descriptions

## Infra — fait

- [x] PostgreSQL (Drizzle ORM) — table `avis` avec `produitNom` (dénormalisé) + `masque` (3 états : en attente / visible / masqué)
- [x] `lib/db/avis.ts` — `getAvisForLivre`/`getAvisForBouture` via `unstable_cache` + tag `avis`
- [x] `POST /api/avis` — validation + écriture en DB (status `pending`)
- [x] Seed avis.json → DB (5 avis approved)

## Infra — plus tard

- [ ] MinIO — stockage images boutures (tester leslibraires.fr API d'abord)
- [ ] Meilisearch — quand catalogue > ~500 entrées

## À définir

- [ ] Rebrand "newsletter"
- [ ] Font body
- [ ] Éco-conception (thegreenwebfoundation.org)
