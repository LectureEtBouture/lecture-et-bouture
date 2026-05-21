# Architecture & Vision : Lecture & Bouture

Ce document détaille les choix techniques, la structure architecturale et la philosophie qui guident le projet **Lecture & Bouture**.

---

## 1. La Stack Technique

### Core
- **Next.js 16 (App Router)** : Framework React pour le front-end et le back-office, utilisant le rendu serveur (SSR) et statique (SSG) pour optimiser les performances et le SEO.
- **React 19** : Bibliothèque pour la construction d'interfaces utilisateur modernes.
- **TypeScript** : Langage de programmation pour un typage statique fort, garantissant la robustesse du code.
- **PostgreSQL 16** : Système de gestion de base de données relationnelle pour le stockage des données locales (enrichissements, avis, utilisateurs, etc.).
- **Drizzle ORM** : ORM TypeScript-first pour interagir avec PostgreSQL de manière type-safe avec des migrations SQL idempotentes.

### Services & API
- **Google Books API** : Source de vérité principale pour le catalogue de livres (recherche, métadonnées, images).
- **inventaire.io / Open Library / Wikidata** : Fournisseurs tiers utilisés pour l'enrichissement des métadonnées lors de l'import des livres en back-office.
- **NextAuth v5** : Solution d'authentification gérant 5 rôles distincts via JWT et cookies httpOnly.
- **MinIO** : Serveur de stockage d'objets (S3-compatible) auto-hébergé pour les images (livres, boutures, événements).
- **Resend** : Service d'envoi d'emails transactionnels (notifications, réinitialisations de mots de passe).
- **Loops** : Plateforme de marketing et de gestion de newsletter pour la communication avec les lecteurs.
- **Formbricks** : Outil de collecte de retours et d'enquêtes utilisateurs (surveys) intégré au front-end.
- **Umami Analytics** : Solution d'analyse d'audience respectueuse de la vie privée, auto-hébergée.

### UI & UX
- **Tailwind CSS** : Framework CSS utilitaire pour le stylage rapide et cohérent.
- **Tiptap** : Éditeur de texte riche "headless" pour la gestion des pages éditoriales en back-office.
- **Leaflet** : Bibliothèque de cartographie interactive pour la page contact.
- **dnd-kit** : Boîte à outils de glisser-déposer pour l'organisation des sélections et des éléments en back-office.
- **qrcode.react** : Génération de codes QR pour le partage rapide des paramètres ou des liens de la boutique.

---

## 2. Architecture & Concepts Clés

### Architecture de Données Hybride
- **Source de Vérité Distante** : Pour les livres, la base locale ne stocke pas tout. Elle contient uniquement les **enrichissements éditoriaux** (avis, rayon, genres, note de la librairie). Les métadonnées générales sont récupérées à la volée via Google Books API.
- **Liaison par URI** : La clé de liaison entre la DB locale et les API externes est l'ISBN ou l'ID Google Books (`gbid`).

### Découpage & Organisation
- **App Router** : Organisation des routes avec un groupe `(front)` pour la partie publique et un dossier `admin` pour le back-office.
- **Services (lib/services)** : Couche d'abstraction pour les appels aux API externes (Google Books, Inventaire) et la logique métier.
- **Queries (lib/queries)** : Fonctions dédiées à la récupération et à la manipulation des données via Drizzle.
- **Actions (lib/actions)** : Utilisation des "Server Actions" de Next.js pour les mutations de données.

### Atomic Design & Identité Visuelle
- **"L'Herbier de l'Esprit"** : Le concept créatif central. Chaque écran est pensé comme une planche d'herbier (fond sable, encre vert forêt).
- **Système de Design Plat** : Rejet des ombres portées au profit d'une stratification tonale (Sable -> Blanc Crème -> Blanc Pur) pour exprimer la profondeur.
- **Rythme & Vide** : Le vide est considéré comme du contenu. Espacement généreux (5rem entre sections) pour favoriser une navigation calme.
- **Sharp Edges** : Pas de coins arrondis sur les boutons et les cartes, renforçant l'aspect "éditorial" et rigoureux.

---

## 3. Ambiance & Philosophie

### Privacy & Éthique
- **Umami Analytics** : Outil d'analyse d'audience respectueux de la vie privée (privacy-first), auto-hébergé, sans cookies tiers, garantissant l'anonymat des visiteurs.
- **Self-Hosting** : Utilisation de solutions auto-hébergées (MinIO, Umami, PostgreSQL) pour garder le contrôle total sur les données et l'indépendance technologique.
- **Eco-conception** : Volonté d'optimisation énergétique (audit prévu via thegreenwebfoundation.org) et sobriété numérique (pas de scripts superflus, images optimisées).

### Philosophie Produit
- **La Lenteur est un Luxe** : Absence délibérée de techniques d'UX urgentes (compteurs, promos flash, badges "best-seller"). Le site invite à la flânerie et à la découverte.
- **Curation vs Consommation** : L'interface privilégie la présentation soignée ("spécimens") à la vente de masse. L'acte commercial final est déporté vers des partenaires éthiques (leslibraires.fr).

---

## 4. Outils de Développement & Infrastructure

- **Docker Compose** : Orchestration des services locaux (DB, MinIO, Adminer, Portainer).
- **Caddy** : Serveur proxy inverse (reverse proxy) gérant le HTTPS local automatiquement pour un environnement de développement sécurisé.
- **Adminer / Portainer** : Outils de gestion graphique pour la base de données et les conteneurs Docker.
- **Drizzle Studio** : Interface utilisateur pour l'exploration et la modification rapide des données en DB.
- **Qualité de Code** : Utilisation d'**ESLint** pour le linting, **Prettier** pour le formatage automatique, et **Husky** pour garantir la qualité via des git hooks (formatage avant commit).
