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

function buildSparqlQuery(isbn: string): string {
    return `
SELECT ?item ?titre ?auteurLabel ?editeurLabel ?annee ?serieLabel ?image WHERE {
  { ?item wdt:P212 "${isbn}" } UNION { ?item wdt:P957 "${isbn}" }
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
