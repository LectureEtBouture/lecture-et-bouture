import type { Metadata } from 'next';
import { sendContactEmail } from '@/services/resend';

export const metadata: Metadata = {
    title: 'Contact',
    description: "Contactez l'équipe Lecture & Boutures.",
};

async function handleContact(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    await sendContactEmail({ name, email, message });
}

export default function ContactPage() {
    return (
        <section className="max-w-2xl mx-auto px-6 py-section">
            <h1 className="font-serif text-4xl text-primary">Contact</h1>
            <p className="mt-4 mb-10 text-muted">
                Une question ? Un projet ? Écrivez-nous.
            </p>
            <form action={handleContact} className="flex flex-col gap-6">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Nom</span>
                    <input
                        name="name"
                        type="text"
                        required
                        className="border border-border rounded px-4 py-2.5 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Email</span>
                    <input
                        name="email"
                        type="email"
                        required
                        className="border border-border rounded px-4 py-2.5 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                </label>
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium">Message</span>
                    <textarea
                        name="message"
                        required
                        rows={6}
                        className="border border-border rounded px-4 py-2.5 bg-surface text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                </label>
                <button
                    type="submit"
                    className="self-start bg-primary text-background px-8 py-3 rounded font-medium hover:bg-primary-light transition-colors"
                >
                    Envoyer
                </button>
            </form>
        </section>
    );
}
