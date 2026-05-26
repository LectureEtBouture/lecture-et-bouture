'use server';

import { auth } from '@/auth';
import { sendDevFeedbackEmail } from '@/services/resend';

export async function envoyerFeedbackDev(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error('Non autorisé');

    const type = formData.get('type') as 'Bug' | 'Feedback' | 'Idée';
    const message = (formData.get('message') as string)?.trim();
    const devEmail = process.env.DEVELOPPER_EMAIL;

    if (!devEmail) throw new Error('DEVELOPPER_EMAIL non défini');
    if (!message) throw new Error('Message vide');

    await sendDevFeedbackEmail({
        type,
        message,
        fromEmail: session.user?.email ?? 'inconnu',
        devEmail,
    });
}
