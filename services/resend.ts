import { storeConfig } from '@/lib/config';

type ResetPasswordEmailData = {
    to: string;
    resetUrl: string;
};

export async function sendResetPasswordEmail(data: ResetPasswordEmailData) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: data.to,
            subject: `[${storeConfig.name}] Réinitialisation de votre mot de passe`,
            text: [
                `Bonjour,`,
                ``,
                `Une demande de réinitialisation de mot de passe a été effectuée pour votre compte back-office ${storeConfig.name}.`,
                ``,
                `Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe (valable 1 heure) :`,
                ``,
                data.resetUrl,
                ``,
                `Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
            ].join('\n'),
        }),
    });

    if (!res.ok) {
        throw new Error(`Resend error: ${res.status}`);
    }

    return res.json();
}

type ContactEmailData = {
    name: string;
    email: string;
    message: string;
};

export async function sendContactEmail(data: ContactEmailData) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: process.env.RESEND_TO_EMAIL,
            subject: `[${storeConfig.name}] Message de ${data.name}`,
            text: `De : ${data.name} <${data.email}>\n\n${data.message}`,
        }),
    });

    if (!res.ok) {
        throw new Error(`Resend error: ${res.status}`);
    }

    return res.json();
}
