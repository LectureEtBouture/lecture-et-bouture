import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { bookProvider } from '@/lib/services/books';
import type { LivreSearchResult } from '@/lib/services/books';

// Heuristique auteur : ≤ 3 mots, pas de chiffres → probablement un nom propre
function looksLikeAuthor(q: string): boolean {
    const words = q.trim().split(/\s+/);
    return words.length <= 3 && !/\d/.test(q);
}

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const query = request.nextUrl.searchParams.get('q');
    if (!query || query.trim().length < 2) {
        return NextResponse.json(
            { error: 'Paramètre q trop court' },
            { status: 400 },
        );
    }

    const q = query.trim();
    const opts = { maxResults: 40 };

    const [base, inauthor] = await Promise.all([
        bookProvider.rechercherParTitre(q, opts),
        looksLikeAuthor(q)
            ? bookProvider.rechercherParTitre(`inauthor:"${q}"`, opts)
            : Promise.resolve([] as LivreSearchResult[]),
    ]);

    const seen = new Set(base.map((r) => r.uri));
    const merged = [...base, ...inauthor.filter((r) => !seen.has(r.uri))];

    return NextResponse.json(merged);
}
