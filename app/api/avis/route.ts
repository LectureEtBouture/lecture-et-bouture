import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avis } from '@/db/schema';
import livresData from '@/data/livres.json';
import bouturesData from '@/data/boutures.json';

function resolveProduitNom(type: string, itemId: number): string | null {
    if (type === 'livre') {
        const livre = (
            livresData as { id: number; titre: string; auteur: string }[]
        ).find((l) => l.id === itemId);
        return livre ? `${livre.titre} — ${livre.auteur}` : null;
    }
    if (type === 'bouture') {
        const bouture = (bouturesData as { id: number; nom: string }[]).find(
            (b) => b.id === itemId,
        );
        return bouture ? bouture.nom : null;
    }
    return null;
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { type, itemId, auteurNom, note, texte } = body;

    if (
        (type !== 'livre' && type !== 'bouture') ||
        typeof itemId !== 'number' ||
        typeof auteurNom !== 'string' ||
        auteurNom.trim().length < 2 ||
        auteurNom.length > 100 ||
        typeof note !== 'number' ||
        note < 1 ||
        note > 5 ||
        (texte !== undefined && typeof texte !== 'string') ||
        (typeof texte === 'string' && texte.length > 500)
    ) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 422 });
    }

    await db.insert(avis).values({
        type,
        livreId: type === 'livre' ? itemId : null,
        boutureId: type === 'bouture' ? itemId : null,
        produitNom: resolveProduitNom(type, itemId),
        auteurNom: auteurNom.trim(),
        note,
        texte: typeof texte === 'string' ? texte.trim() || null : null,
        approuve: false,
        masque: false,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
}
