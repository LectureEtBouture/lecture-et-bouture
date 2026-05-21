# PRD — Lecture & Bouture

## Vision

Concept hybride : livres académiques + boutures végétales. Expérience d'achat sereine, minimaliste, immersive.

**North Star :** _"Cultiver l'esprit, nourrir la terre."_

---

## Public Cible

| Segment                               | Profil                                     |
| ------------------------------------- | ------------------------------------------ |
| Bibliophiles esthètes                 | Éditions soignées, littérature de fond     |
| Botanistes amateurs / collectionneurs | Spécimens rares, conseils d'entretien      |
| Citadins en quête de sérénité         | Design minimaliste, sensibilité écologique |

---

## Pages

| Route                           | Description                                                                                                                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                             | Accueil — hero boutique physique, sections livres dans l'ordre : Choix de la librairie → Nouveautés → Tendances → sections par genre (2–3), CTA "Me faire surprendre". Chaque section a un lien "Voir plus" pointant vers `/livres` avec les filtres pré-appliqués. |
| `/surprendre`                   | Livre aléatoire parmi `choixLibrairie` + note éditoriale + lien leslibraires.fr                                                                                                                                                                                     |
| `/concept`                      | Philosophie éditoriale — contenu réel (3 sections : concept, conservateur, lenteur)                                                                                                                                                                                 |
| `/livres`                       | Catalogue livres avec FilterBar (rayon, genre, sort, choix de la librairie) + recherche live via Google Books                                                                                                                                                       |
| `/livres/[slug]`                | Fiche livre — détails, avis (avant recos), même auteur, même univers, même genre                                                                                                                                                                                    |
| `/boutures`                     | Vitrine bento — section explicative + grille shift (grande/petite carte alternées). Pas de filterbar.                                                                                                                                                               |
| `/boutures/[slug]`              | Fiche bouture — détails, avis                                                                                                                                                                                                                                       |
| `/contact`                      | Formulaire → Resend, feedback succès/erreur via redirect                                                                                                                                                                                                            |
| `/mentions-legales`             | Mentions légales                                                                                                                                                                                                                                                    |
| `/politique-de-confidentialite` | Politique de confidentialité                                                                                                                                                                                                                                        |
| `/cgv`                          | Conditions Générales de Vente                                                                                                                                                                                                                                       |
| `/cgu`                          | Conditions Générales d'Utilisation                                                                                                                                                                                                                                  |
| `/cookies`                      | Politique cookies + bandeau                                                                                                                                                                                                                                         |
| `/admin`                        | Back-office — gestion livres, boutures, avis, sélections, événements                                                                                                                                                                                                |
| `/admin/livres`                 | CRUD livres (incl. choix de la librairie)                                                                                                                                                                                                                           |
| `/admin/boutures`               | CRUD boutures                                                                                                                                                                                                                                                       |
| `/admin/genres`                 | CRUD genres littéraires                                                                                                                                                                                                                                             |
| `/admin/rayons`                 | CRUD rayons (classification commerciale)                                                                                                                                                                                                                            |
| `/admin/avis`                   | Modération avis                                                                                                                                                                                                                                                     |
| `/admin/selections`             | Gestion sélections du conservateur                                                                                                                                                                                                                                  |
| `/admin/evenements`             | CRUD événements                                                                                                                                                                                                                                                     |
| `/admin/pages`                  | Éditeur RTE pages éditoriales (concept, mentions légales, CGV, CGU, cookies, politique)                                                                                                                                                                             |
| `/admin/parametres`             | Paramètres boutique : horaires, fermetures exceptionnelles, annonce globale, mode maintenance, réseaux sociaux                                                                                                                                                      |

---

## Fonctionnalités

- **Catalogue livres** : trois modes — découverte (défaut, pas de filtre : choix librairie + tendances + nouveautés via Google Books, infinite scroll `startIndex`), browse (livres enrichis par la librairie, filtrables par rayon/genre/choix, tri : alpha, date, note, prix asc/desc, toujours visible) et search (live Google Books API, 40 résultats par batch, enrichis en overlay, tri : relevance/newest). Toggle ebook (`?ebook=1`, défaut off) sur toutes les vues. Bouton "Charger plus" en fallback de l'infinite scroll. Expansion auteur automatique : si < 4 résultats physiques d'un même auteur, second appel `inauthor:"X"` pour retrouver les autres tomes. Lien "Vous ne trouvez pas ?" → leslibraires.fr en bas de page.
- **Architecture livres** : DB locale = enrichissements uniquement (rayon, genre, prix indicatif, note librairie, choix). Métadonnées catalogue (titre, auteur, image, description…) = Google Books API. Achat via leslibraires.fr par ISBN. inventaire.io utilisé pour l'import BO (meilleure qualité de métadonnées FR).
- **Vitrine boutures** : bento grid non-linéaire, section explicative (qu'est-ce qu'une bouture, entretien, démarche). Pas de filterbar — c'est une vitrine patrimoniale, pas un catalogue e-commerce. Images dans `public/cuttings/`, fallback couleur par condition lumineuse.
- **Fiche produit** : détails complets (titre, auteur, éditeur, date au format dd/mm/yyyy, nombre de pages, catégories BISAC traduites, description HTML sanitizée — masquée si langue ≠ FR ou < 20 chars). Ordre : infos → description → tags BISAC → note librairie → **avis** → même genre → même auteur (`inauthor:"X"`) → même univers (BISAC rayon). Prix physique indicatif + prix numérique Google Play si disponible. Badge "Disponible en ebook" + lien aperçu Google Books. Note + choix librairie affichés seulement si enrichissement présent.
- **"Me faire surprendre"** : page `/surprendre`, livre aléatoire `choixLibrairie` + note éditoriale. `force-dynamic` côté serveur.
- **Avis utilisateurs** : formulaire de dépôt d'avis sur fiche livre/plante, modération dans le back-office avant publication
- **Sélection du Conservateur** : curations dynamiques gérées via back-office
- **Rayons** : 15 rayons (Sciences & Nature, Littérature, Philosophie & Essai, Histoire, Imaginaire, BD, Manga, Jeunesse, Policier & Thriller, Biographie, Art & Beaux livres, Cuisine, Voyage, Développement personnel, Poésie & Théâtre). Identifiés par slug dans l'URL (`?rayon=imaginaire`). En mode catalogue : filtre DB (`rayonId`). En mode recherche : termes descriptifs français injectés dans la query Google Books (`manga`, `roman littérature fiction`, `fantasy fantastique "science fiction"` etc.) via `lib/services/books/bisac.ts`. Administrable en BO.
- **Choix de la librairie** : badge "Choix de la librairie" sur les livres sélectionnés, administrable en BO, filtrable dans le catalogue
- **Événements** : agenda d'événements (rencontres, lectures, ateliers) administrable en BO, affiché sur la home et sur une page dédiée
- **Achat** : redirection leslibraires.fr (v1) → API stocks/panier (v2+)
- **Saisie livre assistée (back-office)** : formulaire d'enrichissement uniquement. Recherche par titre/auteur (inventaire.io) ou ISBN → sélection → pré-remplissage `inventaireUri`. Admin saisit ensuite : rayon, genres, prix indicatif, note librairie, choix de la librairie. Pas de saisie de métadonnées catalogue (titre, auteur, etc.) — tout vient de l'API.
- **RTE descriptions** : éditeur rich text (Tiptap) pour les champs `description` des livres et boutures. Rendu en HTML côté front.
- **Pages éditoriales** : concept, mentions légales, CGV, CGU, cookies, politique de confidentialité — contenu rédigé via RTE en back-office, stocké en DB, sanitizé côté serveur avant rendu (`sanitize-html`). Éditeur complet : H1–H6, listes, couleurs texte/fond, alignement, surlignage, taille de police, liens (avec option nouvel onglet), accordéon, saut de ligne, bubble menu contextuel, drag handle. Composant partagé `PageEditoriale` (slug + title) pour les layouts standards ; nouvelles pages édito = 8 lignes. Prévisualisation sécurisée via Draft Mode (bouton BO → `/api/preview?secret=...` → front avec bannière "Mode prévisualisation").
- **Événements** : agenda administrable, état calculé à la volée (passé / en cours / à venir), événement mis en avant sur la home (en cours prioritaire, sinon prochain).
- **Erreurs custom** : 404 et 500 dans le thème.
- **Contact** : formulaire → Resend
- **Newsletter** : Loops
- **Analytics** : Umami (privacy-first)
- **Écoconception** : design sobre, certifications existantes affichées, section engagement
- **Back-office** : CRUD livres/boutures/événements/rayons, modération avis, gestion sélections, gestion choix de la librairie (auth simple, accès /admin)

---

## Stack

| Couche               | Choix                                                                                                                                                                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework            | Next.js 16 App Router — front + back-office + API Routes                                                                                                                                                                                        |
| BDD                  | PostgreSQL 16 + Drizzle ORM (PKs uuid, migrations SQL idempotentes)                                                                                                                                                                             |
| Auth                 | NextAuth v5 — credentials, JWT, rôles (5 niveaux)                                                                                                                                                                                               |
| **Catalogue public** | **Google Books API** — browse, search, discovery (tendances/nouveautés/genres BISAC)                                                                                                                                                            |
| **Import BO**        | **inventaire.io + Open Library** — ISBN → métadonnées FR (titre, auteur, description)                                                                                                                                                           |
| Images               | MinIO self-hosted — `next/image` + remotePatterns                                                                                                                                                                                               |
| Image fallback       | Open Library Covers API (`-L.jpg`) quand Google Books n'a pas de couverture                                                                                                                                                                     |
| Email                | Resend — reset password                                                                                                                                                                                                                         |
| Newsletter           | Loops                                                                                                                                                                                                                                           |
| Analytics            | Umami (privacy-first)                                                                                                                                                                                                                           |
| Surveys              | Formbricks                                                                                                                                                                                                                                      |
| Rich text            | Tiptap — pages éditoriales BO                                                                                                                                                                                                                   |
| Sanitisation HTML    | sanitize-html — descriptions livres + pages éditoriales                                                                                                                                                                                         |
| Langue               | `hl=fr` systématique. `langRestrict=fr` uniquement sur les recherches ISBN/URI/titre (user-initiated). Désactivé sur discovery (tendances/nouveautés/catégories) pour maximiser les résultats — les requêtes françaises assurent la pertinence. |
| Dark mode            | Non                                                                                                                                                                                                                                             |

---

## Identité Visuelle

| Token                | Valeur                              |
| -------------------- | ----------------------------------- |
| `--color-primary`    | `#2D4B3E` — vert profond            |
| `--color-background` | `#F5F4EF` — beige sable             |
| `--color-foreground` | `#1A1A1A` — texte principal         |
| `--font-serif`       | Noto Serif                          |
| `--font-sans`        | Raleway                             |
| Icônes               | Lignes fines, inspiration botanique |
| Animations           | Parallax, transitions fluides       |

---
