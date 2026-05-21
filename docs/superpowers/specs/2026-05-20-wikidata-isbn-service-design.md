# Design — Service Wikidata ISBN

Date : 2026-05-20  
Statut : approuvé

## Objectif

Service serveur pour enrichir un livre depuis son ISBN via l'API Wikidata.  
Phase 1 : couche service + Route Handler de test + script CLI.  
Phase 2 (plus tard) : intégration UI dans `LivreForm`.

## Périmètre

- Recherche par ISBN-13 ou ISBN-10
- Retourne les champs mappables sur `livres` : titre, auteur, éditeur, année, série, image
- Auth Bearer OAuth2 (ACCESS_TOKEN depuis env)
- Pas d'écriture BDD dans cette phase

## Architecture

```
lib/services/wikidata.ts       — logique SPARQL + types
app/api/wikidata/isbn/route.ts — Route Handler GET ?q=<isbn> (test)
scripts/wikidata-test.ts       — script CLI tsx pour test direct
```

## API choisie

**SPARQL** sur `https://query.wikidata.org/sparql`

Raison : une seule requête retourne tous les champs. Pas de pagination. Bearer token en header `Authorization`.

### Propriétés Wikidata utilisées

| Champ         | Propriété Wikidata |
| ------------- | ------------------ |
| ISBN-13       | P212               |
| ISBN-10       | P957               |
| Titre         | P1476              |
| Auteur        | P50                |
| Éditeur       | P123               |
| Date parution | P577               |
| Série         | P179               |
| Image         | P18                |

## Type retourné

```ts
type WikidataLivreResult = {
    wikidataId: string;
    titre: string | null;
    auteur: string | null;
    editeur: string | null;
    anneePublication: number | null;
    serie: string | null;
    imageUrl: string | null; // URL Commons directe
};
```

## Sécurité

- `ACCESS_TOKEN` côté serveur uniquement (pas de `NEXT_PUBLIC_`)
- Route Handler `/api/wikidata/isbn` : accès restreint aux sessions admin (`auth()`)
- Script CLI : uniquement local

## Variables d'environnement

```
WIKIDATA_ACCESS_TOKEN=<ACCESS_TOKEN>
```

> Note : `ACCESS_TOKEN` dans `.env.local` est renommé `WIKIDATA_ACCESS_TOKEN` pour éviter toute ambiguïté avec d'autres services OAuth.

## Gestion des erreurs

- ISBN non trouvé → `null` (pas d'exception)
- Erreur réseau / SPARQL → throw, géré par le Route Handler (500)
- Champs absents → `null` sur chaque propriété optionnelle

## Évolutions prévues (Phase 2)

- Bouton "Remplir depuis ISBN" dans `LivreFormIdentite`
- Server Action `lookupISBN(isbn)` qui appelle le service et retourne les données au client
- Préremplissage du formulaire via `useState` dans un wrapper client
