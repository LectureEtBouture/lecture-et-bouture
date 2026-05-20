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
