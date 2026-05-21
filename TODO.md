# TODO

## Backlog

- [ ] Recherche BO livres — chercher par titre/auteur Google Books dans `/admin/livres` (filtre complémentaire au filtre URI local)
- [ ] Import ISBN BO — inventaire.io en fallback uniquement (Google Books prioritaire ; les deux coexistent actuellement)
- [ ] Formbricks — vérifier trigger survey (action key `"test"` → enquête s'ouvre)
- [ ] Éco-conception — audit thegreenwebfoundation.org
- [ ] API leslibraires.fr / Librisoft — stocks temps réel, panier, commandes (v2)

---

## Fait

### Front public

- `/` — hero, Choix librairie + Nouveautés + Tendances (Google Books) + sections genre + CTA "Me faire surprendre"
- `/livres` — 3 modes (découverte/catalogue/recherche), FilterBar, infinite scroll, toggle ebook, expansion auteur
- `/livres/[slug]` — fiche complète (description HTML, BISAC, date, pages, ebook, aperçu), avis, recos (même genre/auteur/univers)
- `/boutures` + `/boutures/[slug]` — vitrine bento, fiches, avis
- `/surprendre` — livre aléatoire parmi les choix librairie (`force-dynamic`)
- `/evenements` — agenda (en cours / à venir / passé), `EvenementEnAvant`
- `/selections` — sélections actives du conservateur
- `/contact` — formulaire + carte Leaflet
- Pages éditoriales — concept, mentions légales, CGV, CGU, cookies, politique
- SEO : sitemap.xml, robots.txt (DB), Open Graph Satori, metadata
- Historique visites localStorage → recos
- 404/500 custom, fonts Raleway + Dancing Script, footer manifeste, logo

### Back-office

- Dashboard — stats + alertes + agenda
- Livres — CRUD + import ISBN (inventaire.io) + recherche titre/auteur (Google Books) + pré-remplissage enrichissement (rayon, genres, prix)
- Liste livres — titre + couverture via batch fetch Google Books, `titre` dénormalisé en DB
- Boutures, Genres, Rayons — CRUD
- Avis — modération 3 états (en attente / visible / masqué), titre + couv du livre (batch fetch), lien fiche front
- Sélections, Événements — CRUD + ordre + toggle publié
- Pages éditoriales — Tiptap + prévisualisation Draft Mode (`PreviewBanner`)
- Paramètres — horaires, fermetures, annonce, maintenance, réseaux sociaux, QR code (export PNG + SVG)
- Utilisateurs — CRUD + 5 rôles (voir `ROLES.md`), reset password self-service + admin-initiated (Resend)
- Journaux — FIFO 200, guard `super_admin`

### Architecture livres (Phases A–M)

- DB locale = enrichissements uniquement (`inventaire_uri NOT NULL UNIQUE` + rayon/genres/prix/note/choix)
- `LivreComplet` = merge(métadonnées Google Books, enrichissement local) via `lib/services/books/merge.ts`
- `bookProvider` = `GoogleBooksProvider` (front + discovery) ; `importProvider` = `InventaireProvider` (import BO uniquement)
- Catégories BISAC → français via `categories-fr.ts` ; `suggestRayonSlug` + `suggestGenreIds` (auto-suggestion à l'import)
- Descriptions HTML sanitizées (`sanitize-html`), masquées si `language !== 'fr'` ou < 20 chars
- Slugs : `isbn:XXX` → `XXX`, `gbid:XXX` → `gbid-XXX`
- `langRestrict` : actif sur ISBN/URI/titre. Désactivé sur discovery (requêtes françaises assurent la pertinence)
- Description fallback : Open Library (`fetchOLDescriptionByISBN`) si Google Books absent

### Infra & Auth

- PostgreSQL 16 + Drizzle ORM — UUID PKs, migrations idempotentes, seed avec Maps cross-références
- MinIO — upload API, `ImageUpload` component, `next/image` + remotePatterns dynamique depuis `MINIO_PUBLIC_URL`
- NextAuth v5 — JWT, httpOnly cookies, 5 rôles, `types/next-auth.d.ts`, routes whitelist middleware
- `lib/config.ts` `storeConfig` + `lib/metadata.ts` — templatisation complète (`NEXT_PUBLIC_STORE_*`)
- Newsletter Loops, Analytics Umami (privacy-first), Surveys Formbricks
- `VusRecemment` — clear item individuel (×, visible au hover) + clear all ("Effacer" en header), `removeVisit`/`clearHistory` dans `useVisitHistory`
- Boutures images — `CoverPanel` fiche affiche `next/image` (était fond coloré seul) ; `imageAlt` ajouté à `BouturePublique` query ; `BoutureCard.tsx` dead code supprimé
