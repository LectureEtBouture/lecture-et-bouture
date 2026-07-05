import {
    CappedMap,
    create,
    deriveHmacKeySecret,
    randomInt,
} from 'altcha-lib/frameworks/nextjs';
import { deriveKey } from 'altcha-lib/algorithms/pbkdf2';

const HMAC_SECRET = process.env.ALTCHA_HMAC_SECRET!;
const HMAC_KEY_SECRET = await deriveHmacKeySecret(HMAC_SECRET);
const store = new CappedMap<string, boolean>({ maxSize: 1_000 });

export const altcha = create({
    hmacSignatureSecret: HMAC_SECRET,
    hmacKeySignatureSecret: HMAC_KEY_SECRET,
    createChallengeParameters: () => ({
        algorithm: 'PBKDF2/SHA-256',
        cost: 5_000,
        counter: randomInt(5_000, 10_000),
        expiresAt: new Date(Date.now() + 10 * 60_000),
    }),
    deriveKey,
    store,
});

export async function verifyAltcha(payload: unknown): Promise<boolean> {
    if (!payload || typeof payload !== 'string') return false;
    const result = await altcha.verify(
        payload,
        deriveKey,
        HMAC_SECRET,
        HMAC_KEY_SECRET,
        store,
    );
    return result.verification?.verified ?? false;
}
