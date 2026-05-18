import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/livres', label: 'Livres' },
    { href: '/admin/boutures', label: 'Boutures' },
    { href: '/admin/avis', label: 'Avis' },
    { href: '/admin/selections', label: 'Sélections' },
];

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/admin/login');

    return (
        <div className="min-h-screen bg-[#F5F4EF] flex">
            <aside className="w-56 shrink-0 bg-white border-r border-border flex flex-col">
                <div className="px-5 py-5 border-b border-border">
                    <p className="font-serif text-sm font-bold text-[#2D4B3E] tracking-tight">
                        Lecture & Boutures
                    </p>
                    <p className="text-[11px] text-muted uppercase tracking-widest mt-0.5">
                        Back-office
                    </p>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-0.5">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-3 py-2 text-sm text-foreground/70 hover:text-[#2D4B3E] hover:bg-[#F5F4EF] rounded-sm transition-colors"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="px-5 py-4 border-t border-border">
                    <p className="text-[11px] text-muted truncate mb-2">
                        {session.user?.email}
                    </p>
                    <form
                        action={async () => {
                            'use server';
                            await signOut({ redirectTo: '/admin/login' });
                        }}
                    >
                        <button
                            type="submit"
                            className="text-[11px] uppercase tracking-widest text-muted hover:text-foreground transition-colors"
                        >
                            Déconnexion
                        </button>
                    </form>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto px-8 py-8">{children}</div>
            </main>
        </div>
    );
}
