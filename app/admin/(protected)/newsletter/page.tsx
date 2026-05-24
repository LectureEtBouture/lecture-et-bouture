import Link from 'next/link';
import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { asc, desc } from 'drizzle-orm';

export default async function AdminNewsletterPage({
    searchParams,
}: {
    searchParams: Promise<{ order?: string }>;
}) {
    const { order: orderParam } = await searchParams;
    const order = orderParam === 'asc' ? 'asc' : 'desc';

    const subscribers = await db
        .select()
        .from(newsletterSubscribers)
        .orderBy(
            order === 'asc'
                ? asc(newsletterSubscribers.subscribedAt)
                : desc(newsletterSubscribers.subscribedAt),
        );

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Newsletter
                    </h1>
                    <p className="text-sm text-muted">
                        {subscribers.length} abonné
                        {subscribers.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {(['desc', 'asc'] as const).map((opt) => (
                        <Link
                            key={opt}
                            href={`/admin/newsletter?order=${opt}`}
                            className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] border transition-colors ${order === opt ? 'bg-primary border-primary text-background' : 'border-border text-muted hover:border-primary hover:text-primary'}`}
                        >
                            {opt === 'desc' ? 'Plus récents' : 'Plus anciens'}
                        </Link>
                    ))}
                </div>
            </div>

            {subscribers.length === 0 ? (
                <p className="text-sm text-muted py-8 border-t border-border">
                    Aucun abonné pour l&apos;instant.
                </p>
            ) : (
                <div className="border-t border-border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2.5 pr-8 text-[11px] uppercase tracking-widest text-muted font-medium">
                                    Email
                                </th>
                                <th className="text-left py-2.5 text-[11px] uppercase tracking-widest text-muted font-medium">
                                    Date
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscribers.map((sub) => (
                                <tr
                                    key={sub.id}
                                    className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                                >
                                    <td className="py-2.5 pr-8 text-foreground font-medium">
                                        {sub.email}
                                    </td>
                                    <td className="py-2.5 text-muted tabular-nums">
                                        {sub.subscribedAt.toLocaleDateString(
                                            'fr-FR',
                                            {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            },
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
