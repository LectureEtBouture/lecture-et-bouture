'use server';

import { z } from 'zod';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';

const emailSchema = z.string().email();

export async function subscribeToNewsletter(
    email: string,
    honeypot = '',
): Promise<{ ok: boolean; error?: string }> {
    // Silently succeed for bots that fill the hidden field
    if (honeypot) return { ok: true };

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success)
        return { ok: false, error: 'Adresse e-mail invalide.' };

    const apiKey = process.env.LOOPS_API_KEY;
    if (!apiKey)
        return { ok: false, error: 'Service temporairement indisponible.' };

    try {
        const res = await fetch('https://app.loops.so/api/v1/contacts/create', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: parsed.data,
                userGroup: 'lecture-et-bouture',
                subscribed: true,
            }),
        });

        if (res.ok || res.status === 409) {
            await db
                .insert(newsletterSubscribers)
                .values({ email: parsed.data })
                .onConflictDoNothing();
            return { ok: true };
        }

        const data = await res.json().catch(() => ({}));
        return {
            ok: false,
            error: data?.message ?? 'Une erreur est survenue.',
        };
    } catch {
        return { ok: false, error: 'Une erreur est survenue.' };
    }
}
