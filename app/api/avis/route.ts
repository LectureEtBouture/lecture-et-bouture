import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { avis } from '@/db/schema';
import { getOrCreateEnrichissement } from '@/lib/queries/enrichissements';

const WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_REQUESTS = 5;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
        return true;
    }
    if (entry.count >= MAX_REQUESTS) return false;
    entry.count++;
    return true;
}

export async function POST(req: NextRequest) {
    const ip =
        req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '0.0.0.0';
    if (!checkRateLimit(ip)) {
        return NextResponse.json(
            { error: 'Trop de requêtes. Réessayez dans 15 minutes.' },
            { status: 429 },
        );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { type, itemId, auteurNom, note, texte, website } = body;

    // Honeypot — silently succeed so bots don't retry
    if (website) return NextResponse.json({ ok: true }, { status: 201 });

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
