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

type NewsletterDiffusionData = {
    to: string;
    articleTitre: string;
    articleSlug: string;
    articleImage: string | null;
    articleImageAlt: string | null;
    extrait: string;
};

export async function sendNewsletterDiffusion(data: NewsletterDiffusionData) {
    const articleUrl = `${storeConfig.url.replace(/\/$/, '')}/blog/${data.articleSlug}`;
    const primary = '#2d4b3e';

    const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4ef;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ef;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">
        <tr>
          <td style="padding:32px 40px 0;border-top:3px solid ${primary};">
            <p style="margin:0 0 24px;font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#888;">${storeConfig.name}</p>
            <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:26px;font-weight:bold;color:#1a1a1a;line-height:1.3;">${escHtml(data.articleTitre)}</h1>
          </td>
        </tr>
        ${data.articleImage ? `
        <tr>
          <td style="padding:0 40px;">
            <img src="${escHtml(data.articleImage)}" alt="${escHtml(data.articleImageAlt ?? '')}" width="480" style="display:block;width:100%;max-width:480px;height:auto;margin:16px 0;" />
          </td>
        </tr>` : ''}
        <tr>
          <td style="padding:16px 40px 32px;">
            <p style="margin:0 0 24px;font-family:sans-serif;font-size:15px;line-height:1.7;color:#444;">${escHtml(data.extrait)}</p>
            <a href="${articleUrl}" style="display:inline-block;padding:12px 24px;background:${primary};color:#f5f4ef;font-family:sans-serif;font-size:13px;letter-spacing:0.05em;text-decoration:none;">Lire l'article →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e8e6df;">
            <p style="margin:0;font-family:sans-serif;font-size:11px;color:#aaa;">${escHtml(storeConfig.name)} · ${escHtml(storeConfig.address.street)}, ${escHtml(storeConfig.address.city)}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: data.to,
            subject: `Nouvel article — ${data.articleTitre}`,
            html,
        }),
    });

    if (!res.ok) {
        throw new Error(`Resend error: ${res.status}`);
    }
}

type DisponibiliteEmailData = {
    nom: string;
    prenom: string;
    email: string;
    telephone: string | null;
    livres: { titre: string; auteur: string | null; slug: string }[];
};

export async function sendDisponibiliteEmail(data: DisponibiliteEmailData) {
    const primary = '#2d4b3e';
    const count = data.livres.length;

    const livresRows = data.livres
        .map(
            (l) =>
                `<tr><td style="padding:8px 0;border-bottom:1px solid #e8e6df;font-family:sans-serif;font-size:14px;color:#1a1a1a;">
                    <strong>${escHtml(l.titre)}</strong>${l.auteur ? `<span style="color:#8a9e95;"> — ${escHtml(l.auteur)}</span>` : ''}
                </td></tr>`,
        )
        .join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f4ef;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4ef;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%;">
        <tr>
          <td style="padding:32px 40px 0;border-top:3px solid ${primary};">
            <p style="margin:0 0 8px;font-family:sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8a9e95;">${escHtml(storeConfig.name)} — Demande de disponibilité</p>
            <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#1a1a1a;line-height:1.3;">
              ${escHtml(data.prenom)} ${escHtml(data.nom)} demande la disponibilité de ${count} livre${count > 1 ? 's' : ''}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${livresRows}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;background:#f5f4ef;">
            <p style="margin:0 0 4px;font-family:sans-serif;font-size:12px;color:#1a1a1a;"><strong>Contact</strong></p>
            <p style="margin:0 0 2px;font-family:sans-serif;font-size:13px;color:#444;">${escHtml(data.prenom)} ${escHtml(data.nom)}</p>
            <p style="margin:0 0 2px;font-family:sans-serif;font-size:13px;color:#444;"><a href="mailto:${escHtml(data.email)}" style="color:${primary};">${escHtml(data.email)}</a></p>
            ${data.telephone ? `<p style="margin:0;font-family:sans-serif;font-size:13px;color:#444;">${escHtml(data.telephone)}</p>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e8e6df;">
            <p style="margin:0;font-family:sans-serif;font-size:11px;color:#aaa;">${escHtml(storeConfig.name)} · ${escHtml(storeConfig.address.street)}, ${escHtml(storeConfig.address.city)}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: process.env.RESEND_TO_EMAIL,
            subject: `[Disponibilité] ${data.prenom} ${data.nom} — ${count} livre${count > 1 ? 's' : ''}`,
            html,
        }),
    });

    if (!res.ok) throw new Error(`Resend error: ${res.status}`);
}

function escHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
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
