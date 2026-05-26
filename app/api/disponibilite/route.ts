import { NextRequest, NextResponse } from 'next/server';
import { sendDisponibiliteEmail } from '@/services/resend';
import { nudgeStore } from '@/lib/nudge-store';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;

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

type LivrePayload = { titre: string; auteur: string | null; slug: string };

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
    if (!body)
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });

    const { nom, prenom, email, telephone, website, cid, livres } =
        body as Record<string, unknown>;

    // Honeypot — silently succeed
    if (website) return NextResponse.json({ ok: true }, { status: 201 });

    if (
        typeof nom !== 'string' ||
        nom.trim().length < 1 ||
        nom.length > 100 ||
        typeof prenom !== 'string' ||
        prenom.trim().length < 1 ||
        prenom.length > 100 ||
        typeof email !== 'string' ||
        !email.includes('@') ||
        email.length > 200 ||
        (telephone !== null &&
            telephone !== undefined &&
            typeof telephone !== 'string') ||
        !Array.isArray(livres) ||
        livres.length === 0 ||
        livres.length > 50
    ) {
        return NextResponse.json(
            { error: 'Données invalides.' },
            { status: 422 },
        );
    }

    const livresValides: LivrePayload[] = (livres as unknown[])
        .filter(
            (l): l is Record<string, unknown> =>
                l !== null && typeof l === 'object',
        )
        .filter(
            (l) =>
                typeof l.titre === 'string' &&
                typeof l.inventaireUri === 'string',
        )
        .map((l) => ({
            titre: l.titre as string,
            auteur: typeof l.auteur === 'string' ? l.auteur : null,
            slug: typeof l.slug === 'string' ? l.slug : '',
        }));

    if (livresValides.length === 0) {
        return NextResponse.json(
            { error: 'Aucun livre valide.' },
            { status: 422 },
        );
    }

    // TODO: remove try/catch when Resend is properly configured
    try {
        await sendDisponibiliteEmail({
            nom: (nom as string).trim(),
            prenom: (prenom as string).trim(),
            email: (email as string).trim(),
            telephone:
                typeof telephone === 'string' ? telephone.trim() || null : null,
            livres: livresValides,
        });
    } catch (err) {
        console.warn('[disponibilite] email skipped:', err);
    }

    nudgeStore.emit(
        livresValides.map((livre) => ({
            titre: livre.titre,
            slug: livre.slug,
        })),
        typeof cid === 'string' ? cid : undefined,
    );

    return NextResponse.json({ ok: true }, { status: 201 });
}
