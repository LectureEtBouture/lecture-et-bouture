const LT_URL = process.env.LIBRETRANSLATE_URL ?? 'http://localhost:5000';

export async function traduire(
    texte: string,
    source: string,
    cible: string = 'fr',
): Promise<string> {
    if (source === cible) return texte;
    const response = await fetch(`${LT_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: texte, source, target: cible, format: 'text' }),
    });
    if (!response.ok) throw new Error(`LibreTranslate ${response.status}`);
    const data = await response.json();
    return data.translatedText as string;
}
