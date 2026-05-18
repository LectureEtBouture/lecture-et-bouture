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
            subject: `[Lecture & Boutures] Message de ${data.name}`,
            text: `De : ${data.name} <${data.email}>\n\n${data.message}`,
        }),
    });

    if (!res.ok) {
        throw new Error(`Resend error: ${res.status}`);
    }

    return res.json();
}
