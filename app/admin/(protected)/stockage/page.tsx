import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getStorageOverview } from '@/lib/queries/storage';
import { StockageBrowser } from './_components/StockageBrowser';
import { StorageQuotaBar } from './_components/StorageQuotaBar';

export default async function StockagePage() {
    const session = await auth();
    if (!['admin', 'super_admin'].includes(session?.user?.role ?? ''))
        notFound();

    const { items, totalBytes, quotaBytes } = await getStorageOverview();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Stockage
                </h1>
                <p className="text-[11px] text-muted mt-0.5">
                    {items.length} fichier{items.length !== 1 ? 's' : ''} dans
                    le bucket
                </p>
            </div>
            <StorageQuotaBar totalBytes={totalBytes} quotaBytes={quotaBytes} />
            <StockageBrowser items={items} />
        </div>
    );
}
