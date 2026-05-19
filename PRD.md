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

| Route                           | Description                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `/`                             | Accueil — hero boutique physique, sections livres thématiques (nouveautés/rayons/choix), CTA "Me faire surprendre" en bas |
| `/surprendre`                   | Livre aléatoire parmi `choixLibrairie` + note éditoriale + lien leslibraires.fr                                           |
| `/concept`                      | Philosophie éditoriale — contenu réel (3 sections : concept, conservateur, lenteur)                                       |
| `/livres`                       | Catalogue livres avec FilterBar complète (rayon, genre, série, éditeur, format, sort, choix)                              |
| `/livres/[slug]`                | Fiche livre — détails, avis                                                                                               |
| `/boutures`                     | Vitrine bento — section explicative + grille shift (grande/petite carte alternées). Pas de filterbar.                     |
| `/boutures/[slug]`              | Fiche bouture — détails, avis                                                                                             |
| `/contact`                      | Formulaire → Resend, feedback succès/erreur via redirect                                                                  |
| `/mentions-legales`             | Mentions légales                                                                                                          |
| `/politique-de-confidentialite` | Politique de confidentialité                                                                                              |
| `/cgv`                          | Conditions Générales de Vente                                                                                             |
| `/cgu`                          | Conditions Générales d'Utilisation                                                                                        |
| `/cookies`                      | Politique cookies + bandeau                                                                                               |
| `/admin`                        | Back-office — gestion livres, boutures, avis, sélections, événements                                                      |
| `/admin/livres`                 | CRUD livres (incl. choix de la librairie)                                                                                 |
| `/admin/boutures`               | CRUD boutures                                                                                                             |
| `/admin/genres`                 | CRUD genres littéraires                                                                                                   |
| `/admin/rayons`                 | CRUD rayons (classification commerciale)                                                                                  |
| `/admin/avis`                   | Modération avis                                                                                                           |
| `/admin/selections`             | Gestion sélections du conservateur                                                                                        |
| `/admin/evenements`             | CRUD événements                                                                                                           |
| `/admin/pages`                  | Éditeur RTE pages éditoriales (concept, mentions légales, CGV, CGU, cookies, politique)                                   |
| `/admin/parametres`             | Paramètres boutique : horaires, fermetures exceptionnelles, annonce globale, mode maintenance, réseaux sociaux             |

---

## Fonctionnalités

- **Catalogue livres** : recherche plein texte (titre, auteur, collection, éditeur, série) + filtres (rayon, genre, série, éditeur, format, tri, choix de la librairie)
- **Vitrine boutures** : bento grid non-linéaire, section explicative (qu'est-ce qu'une bouture, entretien, démarche). Pas de filterbar — c'est une vitrine patrimoniale, pas un catalogue e-commerce. Images dans `public/cuttings/`, fallback couleur par condition lumineuse.
- **Fiche produit** : détails, avis, recommandations (même genre, même auteur, même série)
- **"Me faire surprendre"** : page `/surprendre`, livre aléatoire `choixLibrairie` + note éditoriale (`noteDeLaLibrairie` dans le JSON). `force-dynamic` côté serveur.
- **Avis utilisateurs** : formulaire de dépôt d'avis sur fiche livre/plante, modération dans le back-office avant publication
- **Sélection du Conservateur** : curations dynamiques gérées via back-office
- **Rayons** : classification commerciale indépendante du genre éditorial (Sciences & Nature, Littérature, Imaginaire, Philosophie & Essai, BD, Manga, Jeunesse, Policier & Thriller, Biographie, Art & Beaux livres, Cuisine, Voyage, Développement personnel, Poésie & Théâtre). Chaque livre a un `rayonId`. Filtrable dans le catalogue, visible dans le breadcrumb et la fiche. Administrable en BO. Extensible via API leslibraires.fr.
- **Choix de la librairie** : badge "Choix de la librairie" sur les livres sélectionnés, administrable en BO, filtrable dans le catalogue
- **Événements** : agenda d'événements (rencontres, lectures, ateliers) administrable en BO, affiché sur la home et sur une page dédiée
- **Achat** : redirection leslibraires.fr (v1) → API stocks/panier (v2+)
- **Saisie livre assistée (back-office)** : deux modes d'aide à la saisie via Google Books API — (1) recherche par titre avec autocomplete (suggestions : titre + auteur + éditeur + année + édition) puis préremplissage complet du formulaire au choix ; (2) saisie ISBN seul → préremplissage complet (titre, auteur, éditeur, année, édition, image de couverture, description). Les champs restent éditables après import.
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
| `--font-sans`        | Raleway                             |
| Icônes               | Lignes fines, inspiration botanique |
| Animations           | Parallax, transitions fluides       |

---
