# TODO

## Public — fait

- [x] `/livres` — catalogue avec FilterBar (rayon, genre, série, éditeur, format, sort, choix)
- [x] `/livres/[slug]` — fiche avec CoverPanel, fiche technique, recos, avis
- [x] `/boutures` — catalogue avec BouturesFilterBar (difficulté, lumière, arrosage, sort, choix)
- [x] `/boutures/[slug]` — fiche avec CoverPanel, conseils entretien, avis
- [x] Barre de recherche partagée (debounce 350ms, URL params)
- [x] Images livres : next/image + fallback couleur par genre (`--aspect-book`)
- [x] Navbar mise à jour (boutures)

## Public — à faire

- [ ] Home `/` — sélection conservateur + CTA "Me faire surprendre"
- [ ] Page `/surprendre` — livre aléatoire parmi `choixLibrairie` + édito libraire
- [ ] Contact, concept, mentions légales
- [ ] Formulaire soumission avis (front → modération back-office)
- [ ] Open Graph / Satori (`@vercel/og`) — image OG par fiche
- [ ] LocalStorage historique visites → recos
- [ ] SEO : sitemap.xml, robots.txt, metadata, a11y

## Back-office — à faire

- [ ] Google Books API — auto-fill ISBN → titre/auteur/couverture (création livre)
- [ ] "L'avis de la librairie" — champ BDD + affichage fiche
- [ ] RTE (Tiptap) — éditeur descriptions
- [ ] Modération avis

## Infra — plus tard

- [ ] MinIO — stockage images boutures (tester leslibraires.fr API d'abord)
- [ ] Meilisearch — quand catalogue > ~500 entrées

## À définir

- [ ] Rebrand "newsletter"
- [ ] Font body
- [ ] Éco-conception (thegreenwebfoundation.org)
