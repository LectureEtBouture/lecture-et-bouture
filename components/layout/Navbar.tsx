'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { siteConfig } from '@/lib/metadata';

const navLinks = [
    { href: '/livres', label: 'Livres' },
    { href: '/boutures', label: 'Boutures' },
    { href: '/selections', label: 'Sélections' },
    { href: '/evenements', label: 'Événements' },
    { href: '/concept', label: 'Concept' },
    { href: '/contact', label: 'Contact' },
];

export function Navbar() {
    const [open, setOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-background border-b border-border relative">
            <nav
                className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
                aria-label="Navigation principale"
            >
                <Link
                    href="/"
                    className="flex items-center shrink-0 hover:opacity-80 transition-opacity"
                    onClick={() => setOpen(false)}
                >
                    <Image
                        src="/leb-nobg.png"
                        alt={siteConfig.name}
                        width={485}
                        height={325}
                        className="h-10 w-auto"
                        priority
                    />
                </Link>

                {/* Desktop links */}
                <ul className="hidden md:flex items-center gap-8">
                    {navLinks.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                className="text-sm text-foreground/70 hover:text-primary transition-colors"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>

                {/* Burger */}
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="md:hidden flex flex-col justify-center items-center w-9 h-9 gap-[6px] text-foreground -mr-1"
                    aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
                    aria-expanded={open}
                    aria-controls="mobile-menu"
                >
                    <span
                        className={`block w-5 h-px bg-current transition-all duration-200 ease-out origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`}
                    />
                    <span
                        className={`block w-5 h-px bg-current transition-all duration-200 ease-out ${open ? 'opacity-0 scale-x-0' : ''}`}
                    />
                    <span
                        className={`block w-5 h-px bg-current transition-all duration-200 ease-out origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`}
                    />
                </button>
            </nav>

            {/* Mobile menu */}
            <div
                id="mobile-menu"
                aria-hidden={!open}
                className={`md:hidden absolute top-full left-0 right-0 bg-background border-b border-border transition-all duration-200 ease-out ${
                    open
                        ? 'opacity-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 -translate-y-1 pointer-events-none'
                }`}
            >
                <ul className="max-w-6xl mx-auto px-6 py-3 flex flex-col">
                    {navLinks.map(({ href, label }) => (
                        <li key={href}>
                            <Link
                                href={href}
                                onClick={() => setOpen(false)}
                                className="flex items-center h-11 text-sm text-foreground/80 hover:text-primary transition-colors border-b border-border/50 last:border-0"
                            >
                                {label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </header>
    );
}
