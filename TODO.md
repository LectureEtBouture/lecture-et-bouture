# TODO

## Backlog

### Autres

- [ ] Import ISBN BO — inventaire.io en fallback uniquement (Google Books prioritaire ; les deux coexistent actuellement)
- [ ] Formbricks — vérifier trigger survey (action key `"test"` → enquête s'ouvre)
- [ ] Éco-conception — audit thegreenwebfoundation.org
- [ ] API leslibraires.fr / Librisoft — stocks temps réel, panier, commandes (v2)

---

## Fait

### Blog

- DB — 5 tables (`auteurs_blog`, `categories_blog`, `articles`, `articles_categories`, `articles_lies`) + `avis.article_id` + `avis.note` nullable
- Queries — `getArticles` (filtres catégorie + tri), `getArticleBySlug`, `getArticlesEnAvant`, `getArticlesLies` (OR sur 2 FK), `getCategoriesParArticles` (batch anti-N+1)
- Actions — CRUD articles, togglePublie/EnAvant, addArticleLien/removeArticleLien, CRUD catégories & auteurs
- `/blog` — listing lede + rows, filtres catégories + tri (recents/anciens/alpha) via searchParams
- `/blog/[slug]` — contenu HTML sanitisé, articles liés + même catégorie, avis sans note
- Section home — bento 4 articles `en_avant` (fallback récents), 4 variants selon count
- BO `/admin/blog` — CRUD articles, gestion catégories & auteurs, articles liés optimistic

### Front public

- `/` — hero, Choix librairie + Nouveautés + Tendances (Google Books) + sections genre + CTA "Me faire surprendre"
- `/livres` — 3 modes (découverte/catalogue/recherche), FilterBar, infinite scroll, toggle ebook, expansion auteur
- `/livres/[slug]` — fiche complète (description HTML, BISAC, date, pages, ebook, aperçu), avis, recos (même genre/auteur/univers)
- `/boutures` + `/boutures/[slug]` — vitrine bento, fiches, avis
- `/surprendre` — livre aléatoire parmi les choix librairie (`force-dynamic`)
- `/evenements` — agenda (en cours / à venir / passé), `EvenementEnAvant`
- `/selections` — sélections actives de la libraire
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
- `VusRecemment` — livres uniquement (boutures exclues), clear item individuel (×, hover) + clear all, `removeVisit`/`clearHistory` dans `useVisitHistory`
- Boutures images — `CoverPanel` fiche affiche `next/image` ; `imageAlt` dans `BouturePublique` query ; `BoutureCard.tsx` dead code supprimé
- Couvertures livres — `CoverImage` client component (`onError` → fond coloré si 404) ; OL `?default=false` ; `validateCoverUrl` HEAD check (rejette placeholder Google ~9KB) ; couverture personnalisée admin (`livres.image` + `livres.image_alt`) prioritaire sur Google Books/OL ; `imageAlt` propagé dans `LivreComplet` → `LivreCard` + `CoverPanel`
