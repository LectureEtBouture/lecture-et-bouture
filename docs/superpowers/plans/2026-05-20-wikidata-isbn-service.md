# Wikidata ISBN Service Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Service serveur qui interroge Wikidata via SPARQL pour enrichir un livre depuis son ISBN.

**Architecture:** Une seule fonction `rechercherParISBN(isbn)` dans `lib/services/wikidata.ts` fait un POST SPARQL sur `query.wikidata.org`. Un Route Handler admin-only `/api/wikidata/isbn?q=<isbn>` expose le service pour test HTTP. Un script CLI `scripts/wikidata-test.ts` permet de tester sans démarrer le serveur.

**Tech Stack:** fetch natif, SPARQL (Wikidata), Bearer OAuth2, tsx + dotenv pour le script CLI.

---

## Fichiers

| Fichier                          | Action                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| `.env.local`                     | Ajouter `WIKIDATA_ACCESS_TOKEN` (alias de `ACCESS_TOKEN` existant) |
| `lib/services/wikidata.ts`       | Créer — logique SPARQL + types                                     |
| `app/api/wikidata/isbn/route.ts` | Créer — Route Handler GET admin-only                               |
| `scripts/wikidata-test.ts`       | Créer — script CLI `npx tsx scripts/wikidata-test.ts <isbn>`       |

---

## Task 1 : Variable d'environnement

**Files:**

- Modify: `.env.local`

- [ ] **Step 1 : Ajouter la var nommée clairement**

Ajouter sous `# Wikimedia` dans `.env.local` (garder `ACCESS_TOKEN` existant pour ne pas casser quoi que ce soit, ajouter l'alias) :

```
# Wikimedia / Wikidata
CLIENT_APPLICATION_KEY=<existant>
CLIENT_APPLICATIION_SECRET=<existant>
ACCESS_TOKEN=<existant>
WIKIDATA_ACCESS_TOKEN=<même valeur que ACCESS_TOKEN>
```

> Note : `ACCESS_TOKEN` est trop générique — `WIKIDATA_ACCESS_TOKEN` est utilisé dans le code pour éviter l'ambiguïté. Copier la valeur.

- [ ] **Step 2 : Vérifier la var est bien chargée**

```bash
node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.WIKIDATA_ACCESS_TOKEN?.slice(0,20))"
```

Attendu : les 20 premiers chars du JWT (commence par `eyJ0eXAi...`).

---

## Task 2 : Service Wikidata

**Files:**

- Create: `lib/services/wikidata.ts`

> **Note Wikidata :** P212 stocke ISBN-13 SANS tirets (ex. `9782487700031`). P957 = ISBN-10. P1476 = titre multilingue. P50 = auteur (entité). P123 = éditeur (entité). P577 = date de publication (xsd:dateTime, extraire avec YEAR()). P179 = série (entité). P18 = image (IRI vers Commons, déjà une URL complète).

- [ ] **Step 1 : Créer le fichier de service**

```typescript
// lib/services/wikidata.ts

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';

export type WikidataLivreResult = {
    wikidataId: string;
    titre: string | null;
    auteur: string | null;
    editeur: string | null;
    anneePublication: number | null;
    serie: string | null;
    imageUrl: string | null;
};

function normaliserISBN(isbn: string): string {
    return isbn.replace(/[-\s]/g, '');
}

function buildSparqlQuery(isbn: string): string {
    const clean = normaliserISBN(isbn);
    return `
SELECT ?item ?titre ?auteurLabel ?editeurLabel ?annee ?serieLabel ?image WHERE {
  { ?item wdt:P212 "${clean}" } UNION { ?item wdt:P957 "${clean}" }
  OPTIONAL { ?item wdt:P1476 ?titre }
  OPTIONAL { ?item wdt:P50 ?auteur }
  OPTIONAL { ?item wdt:P123 ?editeur }
  OPTIONAL { ?item wdt:P577 ?date . BIND(YEAR(?date) AS ?annee) }
  OPTIONAL { ?item wdt:P179 ?serie }
  OPTIONAL { ?item wdt:P18 ?image }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "fr,en" }
}
LIMIT 1
    `.trim();
}

export async function rechercherParISBN(
    isbn: string,
): Promise<WikidataLivreResult | null> {
    const query = buildSparqlQuery(isbn);
    const body = new URLSearchParams({ query, format: 'json' });

    const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/sparql-results+json',
        'User-Agent': 'LectureEtBouture/1.0 (contact@lectureetboutures.fr)',
    };

    const token = process.env.WIKIDATA_ACCESS_TOKEN;
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(SPARQL_ENDPOINT, {
        method: 'POST',
        headers,
        body: body.toString(),
    });

    if (!response.ok) {
        throw new Error(
            `Wikidata SPARQL error: ${response.status} ${response.statusText}`,
        );
    }

    const data = await response.json();
    const bindings: Record<string, { value: string }>[] =
        data.results?.bindings ?? [];

    if (bindings.length === 0) return null;

    const row = bindings[0];

    const wikidataId = row.item?.value?.split('/').pop() ?? '';
    const imageRaw = row.image?.value ?? null;
    const imageUrl = imageRaw ? imageRaw.replace('http://', 'https://') : null;
    const anneeRaw = row.annee?.value ?? null;

    return {
        wikidataId,
        titre: row.titre?.value ?? null,
        auteur: row.auteurLabel?.value ?? null,
        editeur: row.editeurLabel?.value ?? null,
        anneePublication: anneeRaw ? parseInt(anneeRaw, 10) : null,
        serie: row.serieLabel?.value ?? null,
        imageUrl,
    };
}
```

- [ ] **Step 2 : Commit**

```bash
git add lib/services/wikidata.ts
git commit -m "feat: add Wikidata SPARQL service for ISBN lookup"
```

---

## Task 3 : Script CLI de test

**Files:**

- Create: `scripts/wikidata-test.ts`

- [ ] **Step 1 : Créer le script**

```typescript
// scripts/wikidata-test.ts
import { config } from 'dotenv';

config({ path: '.env.local' });

import { rechercherParISBN } from '../lib/services/wikidata';

const isbn = process.argv[2];

if (!isbn) {
    console.error('Usage: npx tsx scripts/wikidata-test.ts <isbn>');
    process.exit(1);
}

console.log(`Recherche ISBN : ${isbn} …`);

rechercherParISBN(isbn)
    .then((result) => {
        if (!result) {
            console.log('ISBN non trouvé dans Wikidata.');
        } else {
            console.log(JSON.stringify(result, null, 2));
        }
        process.exit(0);
    })
    .catch((err: Error) => {
        console.error('Erreur :', err.message);
        process.exit(1);
    });
```

- [ ] **Step 2 : Tester avec l'ISBN de référence**

```bash
npx tsx scripts/wikidata-test.ts 978-2-487-70003-1
```

Attendu : objet JSON avec `wikidataId`, `titre`, `auteur`, `editeur`, `anneePublication`, `serie`, `imageUrl`. Certains champs peuvent être `null` si non renseignés dans Wikidata.

En cas de "ISBN non trouvé" : l'édition n'est pas dans Wikidata — tester avec un ISBN connu (ex. `978-2-07-036024-5` = L'Étranger poche Folio).

- [ ] **Step 3 : Ajouter le script dans package.json**

Dans `package.json`, section `"scripts"` :

```json
"wikidata:test": "tsx scripts/wikidata-test.ts"
```

Utilisation : `npm run wikidata:test 978-2-487-70003-1`

- [ ] **Step 4 : Commit**

```bash
git add scripts/wikidata-test.ts package.json
git commit -m "feat: add Wikidata ISBN test script"
```

---

## Task 4 : Route Handler admin

**Files:**

- Create: `app/api/wikidata/isbn/route.ts`

- [ ] **Step 1 : Créer le Route Handler**

```typescript
// app/api/wikidata/isbn/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { rechercherParISBN } from '@/lib/services/wikidata';

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const isbn = request.nextUrl.searchParams.get('q');
    if (!isbn) {
        return NextResponse.json(
            { error: 'Paramètre q manquant' },
            { status: 400 },
        );
    }

    const result = await rechercherParISBN(isbn);

    if (!result) {
        return NextResponse.json(
            { error: 'ISBN non trouvé dans Wikidata' },
            { status: 404 },
        );
    }

    return NextResponse.json(result);
}
```

- [ ] **Step 2 : Tester via curl (serveur Next.js démarré)**

Se connecter au back-office d'abord (`https://app.localhost/admin`), puis dans un autre terminal :

```bash
curl -s "https://app.localhost/api/wikidata/isbn?q=978-2-487-70003-1" \
  --cookie "next-auth.session-token=<token depuis DevTools>" | jq .
```

Ou tester directement dans le navigateur (connecté en admin) :
`https://app.localhost/api/wikidata/isbn?q=978-2-487-70003-1`

Attendu : même JSON que le script CLI.

- [ ] **Step 3 : Commit**

```bash
git add app/api/wikidata/isbn/route.ts
git commit -m "feat: add Wikidata ISBN Route Handler for admin testing"
```
