import {
    CappedMap,
    create,
    deriveHmacKeySecret,
    randomInt,
} from 'altcha-lib/frameworks/nextjs';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';

const store = new CappedMap<string, boolean>({ maxSize: 1_000 });

// Dérivation différée au premier appel — le build ne fournit pas les
// variables d'env runtime (Docker/Railway), donc rien ne doit y accéder
// au chargement du module.
let instance: {
    altcha: ReturnType<typeof create>;
    hmacSecret: string;
    hmacKeySecret: string;
} | null = null;

async function getAltcha() {
    if (instance) return instance;

    const hmacSecret = process.env.ALTCHA_HMAC_SECRET!;
    const hmacKeySecret = await deriveHmacKeySecret(hmacSecret);
    const altcha = create({
        hmacSignatureSecret: hmacSecret,
        hmacKeySignatureSecret: hmacKeySecret,
        createChallengeParameters: () => ({
            algorithm: 'PBKDF2/SHA-256',
            cost: 5_000,
            counter: randomInt(5_000, 10_000),
            expiresAt: new Date(Date.now() + 10 * 60_000),
        }),
        deriveKey,
        store,
    });

    instance = { altcha, hmacSecret, hmacKeySecret };
    return instance;
}

export async function altchaChallengeHandler(req: Request) {
    const { altcha } = await getAltcha();
    return altcha.challengeHandler(req);
}

export async function verifyAltcha(payload: unknown): Promise<boolean> {
    if (!payload || typeof payload !== 'string') return false;
    const { altcha, hmacSecret, hmacKeySecret } = await getAltcha();
    const result = await altcha.verify(
        payload,
        deriveKey,
        hmacSecret,
        hmacKeySecret,
        store,
    );
    return result.verification?.verified ?? false;
}
