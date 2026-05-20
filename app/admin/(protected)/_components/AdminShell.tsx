'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { siteConfig } from '@/lib/metadata';

const baseNavItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/livres', label: 'Livres' },
    { href: '/admin/boutures', label: 'Boutures' },
    { href: '/admin/genres', label: 'Genres' },
    { href: '/admin/rayons', label: 'Rayons' },
    { href: '/admin/avis', label: 'Avis' },
    { href: '/admin/evenements', label: 'Événements' },
    { href: '/admin/selections', label: 'Sélections' },
    { href: '/admin/pages', label: 'Pages' },
];

function getAdminSectionItems(role?: string) {
    const items = [{ href: '/admin/parametres', label: 'Paramètres' }];
    if (role === 'super_admin' || role === 'admin') {
        items.push({ href: '/admin/users', label: 'Utilisateurs' });
    }
    if (role === 'super_admin') {
        items.push({ href: '/admin/logs', label: 'Journaux' });
    }
    return items;
}

function useIsActive(href: string) {
    const pathname = usePathname();
    return href === '/admin'
        ? pathname === '/admin'
        : pathname.startsWith(href);
}

function SidebarNavLink({ href, label }: { href: string; label: string }) {
    const active = useIsActive(href);
    return (
        <Link
            href={href}
            className={`flex items-center px-3 py-2 text-sm rounded-sm transition-colors ${active ? 'bg-background text-primary font-medium' : 'text-foreground/70 hover:text-primary hover:bg-background'}`}
        >
            {label}
        </Link>
    );
}

function SidebarNav({ role }: { role?: string }) {
    const adminSectionItems = getAdminSectionItems(role);
    return (
        <nav className="flex-1 overflow-y-auto flex flex-col">
            <div className="px-3 py-4 space-y-0.5">
                {baseNavItems.map((item) => (
                    <SidebarNavLink key={item.href} href={item.href} label={item.label} />
                ))}
            </div>
            <div className="px-3 pb-4 mt-auto">
                <div className="border-t border-border pt-3 mb-1 px-3">
                    <span className="text-[10px] uppercase tracking-[0.12em] text-muted/60 font-medium">
                        Administration
                    </span>
                </div>
                <div className="space-y-0.5">
                    {adminSectionItems.map((item) => (
                        <SidebarNavLink key={item.href} href={item.href} label={item.label} />
                    ))}
                </div>
            </div>
        </nav>
    );
}

function MobileMenu({
    open,
    onClose,
    email,
    role,
    signOutAction,
}: {
    open: boolean;
    onClose: () => void;
    email: string;
    role?: string;
    signOutAction: () => Promise<void>;
}) {
    const pathname = usePathname();
    const adminSectionItems = getAdminSectionItems(role);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            <div
                className="absolute inset-0 bg-foreground/20"
                onClick={onClose}
            />
            <div className="absolute top-0 left-0 bottom-0 w-64 bg-white flex flex-col shadow-lg">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
                    <div>
                        <p className="font-serif text-sm font-bold text-primary">
                            {siteConfig.name}
                        </p>
                        <a
                            href="/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-muted hover:text-primary transition-colors"
                        >
                            ↗ Voir le site
                        </a>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-foreground transition-colors p-1"
                        aria-label="Fermer le menu"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M2 2L14 14M14 2L2 14"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto flex flex-col">
                    <div className="px-3 py-4 space-y-0.5">
                        {baseNavItems.map((item) => {
                            const active =
                                item.href === '/admin'
                                    ? pathname === '/admin'
                                    : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`flex items-center px-3 py-2.5 text-sm rounded-sm transition-colors ${active ? 'bg-background text-primary font-medium' : 'text-foreground/70 hover:text-primary'}`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                    <div className="px-3 pb-4 mt-auto">
                        <div className="border-t border-border pt-3 mb-1 px-3">
                            <span className="text-[10px] uppercase tracking-[0.12em] text-muted/60 font-medium">
                                Administration
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            {adminSectionItems.map((item) => {
                                const active = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={onClose}
                                        className={`flex items-center px-3 py-2.5 text-sm rounded-sm transition-colors ${active ? 'bg-background text-primary font-medium' : 'text-foreground/70 hover:text-primary'}`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div className="px-5 py-4 border-t border-border shrink-0">
                    <p className="text-[11px] text-muted truncate mb-2">{email}</p>
                    <form action={signOutAction}>
                        <button
                            type="submit"
                            className="text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
                        >
                            Déconnexion
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export function AdminShell({
    children,
    email,
    role,
    signOutAction,
}: {
    children: React.ReactNode;
    email: string;
    role?: string;
    signOutAction: () => Promise<void>;
}) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile top bar */}
            <header className="md:hidden bg-white border-b border-border sticky top-0 z-40">
                <div className="px-4 py-3 flex items-center justify-between gap-4">
                    <Link
                        href="/admin"
                        className="font-serif text-sm font-bold text-primary"
                    >
                        L&amp;B
                    </Link>
                    <button
                        onClick={() => setMenuOpen(true)}
                        className="text-foreground/70 hover:text-primary transition-colors p-1"
                        aria-label="Ouvrir le menu"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M3 5H17M3 10H17M3 15H17"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </button>
                </div>
            </header>

            <MobileMenu
                open={menuOpen}
                onClose={() => setMenuOpen(false)}
                email={email}
                role={role}
                signOutAction={signOutAction}
            />

            {/* Desktop layout */}
            <div className="md:flex">
                <aside className="hidden md:flex w-56 shrink-0 bg-white border-r border-border flex-col h-screen sticky top-0">
                    <div className="px-5 py-5 border-b border-border shrink-0">
                        <p className="font-serif text-sm font-bold text-primary tracking-tight">
                            {siteConfig.name}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                            <p className="text-[11px] text-muted uppercase tracking-widest">
                                Back-office
                            </p>
                            <a
                                href="/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-muted hover:text-primary transition-colors"
                                aria-label="Voir le site"
                            >
                                ↗ Site
                            </a>
                        </div>
                    </div>

                    <SidebarNav role={role} />

                    <div className="px-5 py-4 border-t border-border shrink-0">
                        <p className="text-[11px] text-muted truncate mb-2">{email}</p>
                        <form action={signOutAction}>
                            <button
                                type="submit"
                                className="text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
                            >
                                Déconnexion
                            </button>
                        </form>
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
