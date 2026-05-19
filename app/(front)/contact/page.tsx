import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { sendContactEmail } from '@/services/resend';
import { siteConfig } from '@/lib/metadata';
import { getHoraires, getFermetures } from '@/lib/queries/parametres';
import { HorairesDisplay } from '@/components/ui/HorairesDisplay';
import { MapWrapper } from './_components/MapWrapper';

export const metadata: Metadata = {
    title: 'Contact',
    description: `Contactez l'équipe ${siteConfig.name}.`,
};

interface Props {
    searchParams: Promise<Record<string, string | undefined>>;
}

async function handleContact(formData: FormData) {
    'use server';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
        await sendContactEmail({ name, email, message });
        redirect('/contact?sent=1');
    } catch {
        redirect('/contact?error=1');
    }
}

export default async function ContactPage({ searchParams }: Props) {
    const [params, horaires, fermetures] = await Promise.all([
        searchParams,
        getHoraires(),
        getFermetures(),
    ]);
    const sent = params.sent === '1';
    const error = params.error === '1';

    return (
        <section className="max-w-2xl mx-auto px-6 py-section">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-10">
                Nous écrire
            </p>
            <h1 className="font-serif text-[clamp(1.75rem,3vw,2.5rem)] font-bold text-foreground leading-[1.15] tracking-[-0.01em] mb-4">
                Contact
            </h1>
            <p className="text-base text-muted leading-[1.75] mb-12 max-w-[52ch]">
                Une question sur une commande, un livre introuvable, ou
                simplement l&rsquo;envie d&rsquo;échanger — écrivez-nous.
            </p>

            {sent && (
                <div className="border border-border bg-surface px-6 py-4 mb-10">
                    <p className="text-sm text-foreground">
                        Message envoyé. Nous vous répondrons dans les meilleurs
                        délais.
                    </p>
                </div>
            )}

            {error && (
                <div className="border border-danger bg-surface px-6 py-4 mb-10">
                    <p className="text-sm text-foreground">
                        Une erreur est survenue. Réessayez ou contactez-nous
                        directement par email.
                    </p>
                </div>
            )}

            {!sent && (
                <form action={handleContact} className="flex flex-col gap-6">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                            Nom
                        </span>
                        <input
                            name="name"
                            type="text"
                            required
                            className="border border-border bg-surface text-foreground px-[14px] py-[10px] text-base rounded-sm focus:outline-none focus:border-primary"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                            Email
                        </span>
                        <input
                            name="email"
                            type="email"
                            required
                            className="border border-border bg-surface text-foreground px-[14px] py-[10px] text-base rounded-sm focus:outline-none focus:border-primary"
                        />
                    </label>
                    <label className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-[0.1em] font-medium text-foreground">
                            Message
                        </span>
                        <textarea
                            name="message"
                            required
                            rows={6}
                            className="border border-border bg-surface text-foreground px-[14px] py-[10px] text-base rounded-sm focus:outline-none focus:border-primary resize-none"
                        />
                    </label>
                    <button
                        type="submit"
                        className="self-start bg-primary text-background px-10 py-3.5 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors duration-200 hover:bg-primary-light"
                    >
                        Envoyer
                    </button>
                </form>
            )}

            <section className="mt-20 pt-10 border-t border-border">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-6">
                    Nous trouver
                </p>
                <div className="grid md:grid-cols-2 gap-10 items-start mb-8">
                    <div className="space-y-1">
                        <p className="text-base font-medium text-foreground">
                            {siteConfig.name}
                        </p>
                        <p className="text-sm text-muted leading-relaxed">
                            {siteConfig.address.street}
                            <br />
                            {siteConfig.address.city}
                        </p>
                        <HorairesDisplay
                            horaires={horaires}
                            fermetures={fermetures}
                            className="mt-3"
                        />
                    </div>
                </div>
                <MapWrapper />
            </section>
        </section>
    );
}
