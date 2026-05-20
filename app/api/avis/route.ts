import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avis } from '@/db/schema';

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { type, itemId, auteurNom, note, texte } = body;

    if (
        (type !== 'livre' && type !== 'bouture') ||
        typeof itemId !== 'string' ||
        itemId.length === 0 ||
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
        livreId: type === 'livre' ? (itemId as string) : null,
        boutureId: type === 'bouture' ? (itemId as string) : null,
        produitNom: null,
        auteurNom: auteurNom.trim(),
        note,
        texte: typeof texte === 'string' ? texte.trim() || null : null,
        approuve: false,
        masque: false,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
}
