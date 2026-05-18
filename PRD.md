# PRD — Lecture & Boutures

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

| Route                           | Description                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `/`                             | Accueil — immersion visuelle, sélection du conservateur (dynamique), concept |
| `/concept`                      | Philosophie, engagement écoconception, certifications existantes             |
| `/livres`                       | Catalogue livres                                                             |
| `/livres/[slug]`                | Fiche livre — détails, avis                                                  |
| `/boutures`                     | Catalogue boutures                                                           |
| `/boutures/[slug]`              | Fiche bouture — détails, avis                                                |
| `/contact`                      | Formulaire → Resend                                                          |
| `/mentions-legales`             | Mentions légales                                                             |
| `/politique-de-confidentialite` | Politique de confidentialité                                                 |
| `/cgv`                          | Conditions Générales de Vente                                                |
| `/cgu`                          | Conditions Générales d'Utilisation                                           |
| `/cookies`                      | Politique cookies + bandeau                                                  |
| `/admin`                        | Back-office — gestion livres, boutures, avis, sélections, événements         |
| `/admin/livres`                 | CRUD livres (incl. choix de la librairie)                                    |
| `/admin/boutures`               | CRUD boutures                                                                |
| `/admin/avis`                   | Modération avis                                                              |
| `/admin/selections`             | Gestion sélections du conservateur                                           |
| `/admin/evenements`             | CRUD événements                                                              |

---

## Fonctionnalités

- **Catalogue** : recherche plein texte (titre, auteur, collection, éditeur, série) + filtres (rayon, genre, série, éditeur, format, tri, choix de la librairie)
- **Fiche produit** : détails, avis, recommandations (même genre, même auteur, même série)
- **Avis utilisateurs** : formulaire de dépôt d'avis sur fiche livre/plante, modération dans le back-office avant publication
- **Sélection du Conservateur** : curations dynamiques gérées via back-office
- **Rayons** : classification commerciale indépendante du genre éditorial (Sciences & Nature, Littérature, Imaginaire, Philosophie & Essai, BD, Manga, Jeunesse, Policier & Thriller, Biographie, Art & Beaux livres, Cuisine, Voyage, Développement personnel, Poésie & Théâtre). Chaque livre a un `rayonId`. Filtrable dans le catalogue, visible dans le breadcrumb et la fiche. Administrable en BO. Extensible via API leslibraires.fr.
- **Choix de la librairie** : badge "Choix de la librairie" sur les livres sélectionnés, administrable en BO, filtrable dans le catalogue
- **Événements** : agenda d'événements (rencontres, lectures, ateliers) administrable en BO, affiché sur la home et sur une page dédiée
- **Achat** : redirection leslibraires.fr (v1) → API stocks/panier (v2+)
- **Contact** : formulaire → Resend
- **Newsletter** : Loops
- **Analytics** : Umami (privacy-first)
- **Écoconception** : design sobre, certifications existantes affichées, section engagement
- **Back-office** : CRUD livres/boutures/événements/rayons, modération avis, gestion sélections, gestion choix de la librairie (auth simple, accès /admin)

---

## Stack

| Couche               | Choix                                            |
| -------------------- | ------------------------------------------------ |
| Framework            | Next.js (App Router) — front + back-office + API |
| BDD                  | PostgreSQL                                       |
| ORM                  | Drizzle                                          |
| Auth back-office     | Next-Auth ou credentials simple                  |
| Email transactionnel | Resend                                           |
| Newsletter           | Loops                                            |
| Analytics            | Umami                                            |
| Langue               | FR uniquement                                    |
| Dark mode            | Non                                              |

---

## Identité Visuelle

| Token                | Valeur                              |
| -------------------- | ----------------------------------- |
| `--color-primary`    | `#2D4B3E` — vert profond            |
| `--color-background` | `#F5F4EF` — beige sable             |
| `--color-foreground` | `#1A1A1A` — texte principal         |
| `--font-serif`       | Noto Serif                          |
| `--font-sans`        | Manrope                             |
| Icônes               | Lignes fines, inspiration botanique |
| Animations           | Parallax, transitions fluides       |

---

## Hors scope v1

- Collections / bibliothèque virtuelle
- Intégration API leslibraires.fr (stocks / panier)
- Infinite scroll sur /livres et /boutures (avec cache + optimisations perf — à faire après migration vers PostgreSQL)
