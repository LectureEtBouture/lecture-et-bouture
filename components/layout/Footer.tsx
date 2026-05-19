import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/lib/metadata';

const navExplorer = [
    { href: '/livres', label: 'Livres' },
    { href: '/boutures', label: 'Boutures' },
    { href: '/selections', label: 'Sélections' },
    { href: '/evenements', label: 'Événements' },
    { href: '/surprendre', label: 'Me faire surprendre' },
];

const navBoutique = [
    { href: '/concept', label: 'Notre concept' },
    { href: '/contact', label: 'Contact' },
];

const navLegal = [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/politique-de-confidentialite', label: 'Confidentialité' },
    { href: '/cgv', label: 'CGV' },
    { href: '/cgu', label: 'CGU' },
    { href: '/cookies', label: 'Cookies' },
];

function NavCol({
    label,
    links,
    ariaLabel,
}: {
    label: string;
    links: { href: string; label: string }[];
    ariaLabel: string;
}) {
    return (
        <nav aria-label={ariaLabel}>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted mb-5">{label}</p>
            <ul className="space-y-3">
                {links.map(({ href, label: text }) => (
                    <li key={href}>
                        <Link
                            href={href}
                            className="text-sm text-foreground/70 hover:text-primary transition-colors"
                        >
                            {text}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-border bg-background" aria-label="Pied de page">
            <div className="max-w-6xl mx-auto px-6">

                <div className="pt-16 pb-14 border-b border-border">
                    <p className="font-serif italic text-4xl sm:text-5xl text-primary leading-[1.1] tracking-tight">
                        Cultiver l&apos;esprit,<br />
                        nourrir la terre.
                    </p>
                </div>

                <div className="py-12 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 border-b border-border">
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <Link
                            href="/"
                            className="inline-block hover:opacity-75 transition-opacity"
                        >
                            <Image
                                src="/leb-nobg.png"
                                alt={siteConfig.name}
                                width={485}
                                height={325}
                                className="h-12 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-muted leading-relaxed max-w-[22ch]">
                            {siteConfig.description}
                        </p>
                    </div>

                    <NavCol label="Explorer" links={navExplorer} ariaLabel="Explorer le catalogue" />
                    <NavCol label="La boutique" links={navBoutique} ariaLabel="À propos de la boutique" />
                    <NavCol label="Légal" links={navLegal} ariaLabel="Liens légaux" />
                </div>

                <div className="py-5">
                    <p className="text-xs text-muted">
                        © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
                    </p>
                </div>

            </div>
        </footer>
    );
}
