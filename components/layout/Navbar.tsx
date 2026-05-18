import Link from 'next/link';
import { siteConfig } from '@/lib/metadata';

const navLinks = [
    { href: '/livres', label: 'Livres' },
    { href: '/boutures', label: 'Boutures' },
    { href: '/concept', label: 'Concept' },
    { href: '/contact', label: 'Contact' },
];

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 bg-background border-b border-border">
            <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="font-serif text-lg font-bold text-primary tracking-tight"
                >
                    {siteConfig.name}
                </Link>
                <ul className="flex items-center gap-8">
                    {navLinks.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className="font-sans text-sm text-foreground/70 hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}
