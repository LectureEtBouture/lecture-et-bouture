import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { bookProvider } from '@/lib/services/books';

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

    const results = await bookProvider.rechercherParTitre(query.trim());
    return NextResponse.json(results);
}
