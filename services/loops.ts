export async function subscribeToNewsletter(email: string) {
    const res = await fetch('https://app.loops.so/api/v1/contacts/create', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, source: 'website' }),
    });

    if (!res.ok) {
        throw new Error(`Loops error: ${res.status}`);
    }

    return res.json();
}
