import { db } from '@/db';
import { livres, plantes, avis } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export default async function AdminPage() {
    const [[totalLivres], [totalPlantes], [avisEnAttente]] = await Promise.all([
        db.select({ count: count() }).from(livres),
        db.select({ count: count() }).from(plantes),
        db
            .select({ count: count() })
            .from(avis)
            .where(eq(avis.approuve, false)),
    ]);

    const stats = [
        { label: 'Livres', value: totalLivres.count, href: '/admin/livres' },
        { label: 'Plantes', value: totalPlantes.count, href: '/admin/plantes' },
        {
            label: 'Avis en attente',
            value: avisEnAttente.count,
            href: '/admin/avis',
        },
    ];

    return (
        <div className="space-y-8">
            <h1 className="font-serif text-2xl font-bold text-foreground">
                Dashboard
            </h1>

            <div className="grid grid-cols-3 gap-4">
                {stats.map((s) => (
                    <a
                        key={s.href}
                        href={s.href}
                        className="bg-white px-6 py-5 border border-border hover:border-[#2D4B3E] transition-colors group"
                    >
                        <p className="text-3xl font-serif font-bold text-[#2D4B3E]">
                            {s.value}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-muted mt-1 group-hover:text-[#2D4B3E] transition-colors">
                            {s.label}
                        </p>
                    </a>
                ))}
            </div>
        </div>
    );
}
