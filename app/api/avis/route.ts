import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avis } from '@/db/schema';
import { getOrCreateEnrichissement } from '@/lib/queries/enrichissements';

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

    let livreId: string | null = null;
    if (type === 'livre') {
        // itemId is inventaireUri — auto-create enrichissement row if needed
        const enrichissement = await getOrCreateEnrichissement(itemId);
        livreId = enrichissement.localId;
    }

    await db.insert(avis).values({
        type,
        livreId,
        boutureId: type === 'bouture' ? (itemId as string) : null,
        produitNom: itemId,
        auteurNom: auteurNom.trim(),
        note,
        texte: typeof texte === 'string' ? texte.trim() || null : null,
        approuve: false,
        masque: false,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
}
