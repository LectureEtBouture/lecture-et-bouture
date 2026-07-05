'use server';

import { sendVisitorFeedbackEmail } from '@/services/resend';

export async function envoyerAvisVisiteur(
    formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
    // Honeypot — bots remplissent les champs cachés, les humains non
    if (formData.get('website')) return { ok: true };

    const message = (formData.get('message') as string)?.trim();
    const email = (formData.get('email') as string)?.trim();

    if (!message) return { ok: false, error: 'Message vide.' };

    try {
        await sendVisitorFeedbackEmail({ message, email: email || null });
        return { ok: true };
    } catch {
        return { ok: false, error: "Erreur lors de l'envoi." };
    }
}
