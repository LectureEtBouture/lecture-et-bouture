import { NewsletterForm } from './NewsletterForm';

export function NewsletterSection() {
    return (
        <div className="py-12 border-b border-border flex flex-col md:flex-row md:items-end gap-8 md:gap-16">
            <div className="space-y-2 md:max-w-[36ch]">
                <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
                    Lettres du conservateur
                </p>
                <p className="font-serif text-xl text-foreground leading-snug">
                    Une lettre chaque mois.
                </p>
                <p className="text-sm text-muted leading-relaxed">
                    Sélections, nouveautés, et quelques mots sur les livres et
                    la botanique.
                </p>
            </div>
            <div className="flex-1 max-w-md">
                <NewsletterForm />
            </div>
        </div>
    );
}
