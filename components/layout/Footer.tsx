import Link from 'next/link';
import { siteConfig } from '@/lib/metadata';

const legalLinks = [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/politique-de-confidentialite', label: 'Confidentialité' },
    { href: '/cgv', label: 'CGV' },
    { href: '/cgu', label: 'CGU' },
    { href: '/cookies', label: 'Cookies' },
];

export function Footer() {
    return (
        <footer className="border-t border-border bg-background">
            <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col gap-8 md:flex-row md:justify-between">
                <div className="flex flex-col gap-2">
                    <span className="font-serif font-bold text-primary">
                        {siteConfig.name}
                    </span>
                    <p className="text-sm text-muted max-w-xs">
                        {siteConfig.tagline}
                    </p>
                </div>
                <nav aria-label="Liens légaux">
                    <ul className="flex flex-wrap gap-x-6 gap-y-2">
                        {legalLinks.map(({ href, label }) => (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className="text-xs text-muted hover:text-foreground transition-colors"
                                >
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="border-t border-border">
                <p className="max-w-6xl mx-auto px-6 py-4 text-xs text-muted">
                    © {new Date().getFullYear()} {siteConfig.name}. Tous droits
                    réservés.
                </p>
            </div>
        </footer>
    );
}
