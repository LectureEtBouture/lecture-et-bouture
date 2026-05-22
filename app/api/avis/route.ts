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

    const validType =
        type === 'livre' || type === 'bouture' || type === 'article';
    const noteRequired = type !== 'article';
    const noteValid = noteRequired
        ? typeof note === 'number' && note >= 1 && note <= 5
        : note === undefined || note === null;

    if (
        !validType ||
        typeof itemId !== 'string' ||
        itemId.length === 0 ||
        typeof auteurNom !== 'string' ||
        auteurNom.trim().length < 2 ||
        auteurNom.length > 100 ||
        !noteValid ||
        (texte !== undefined && typeof texte !== 'string') ||
        (typeof texte === 'string' && texte.length > 500)
    ) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 422 });
    }

    let livreId: string | null = null;
    if (type === 'livre') {
        const enrichissement = await getOrCreateEnrichissement(itemId);
        livreId = enrichissement.localId;
    }

    await db.insert(avis).values({
        type,
        livreId,
        boutureId: type === 'bouture' ? (itemId as string) : null,
        articleId: type === 'article' ? (itemId as string) : null,
        produitNom: itemId,
        auteurNom: auteurNom.trim(),
        note: noteRequired ? (note as number) : null,
        texte: typeof texte === 'string' ? texte.trim() || null : null,
        approuve: false,
        masque: false,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
}
