import { isNotNull } from 'drizzle-orm';
import { db } from '@/db';
import { articles, evenements, livres, plantes } from '@/db/schema';
import { BUCKET, minioClient } from '@/lib/minio';
import type { BucketItem } from 'minio';

export const STORAGE_QUOTA_BYTES = 10_000_000_000; // 10 Go
const HEAVY_THRESHOLD_BYTES = 400_000;

export type StorageUsage = {
    type: 'livre' | 'bouture' | 'evenement' | 'article';
    label: string;
    href: string;
} | null;

export type StorageItem = {
    key: string;
    folder: string;
    url: string;
    sizeBytes: number;
    lastModified: Date;
    usedBy: StorageUsage;
    heavy: boolean;
};

function listAllObjects(): Promise<BucketItem[]> {
    return new Promise((resolve, reject) => {
        const items: BucketItem[] = [];
        const stream = minioClient.listObjects(BUCKET, '', true);
        stream.on('data', (item: BucketItem) => items.push(item));
        stream.on('end', () => resolve(items));
        stream.on('error', reject);
    });
}

async function buildUsageIndex(): Promise<Map<string, StorageUsage>> {
    const [livresRows, plantesRows, articlesRows, evenementsRows] =
        await Promise.all([
            db
                .select({
                    id: livres.id,
                    titre: livres.titre,
                    image: livres.image,
                })
                .from(livres)
                .where(isNotNull(livres.image)),
            db
                .select({
                    id: plantes.id,
                    nom: plantes.nom,
                    image: plantes.image,
                })
                .from(plantes)
                .where(isNotNull(plantes.image)),
            db
                .select({
                    id: articles.id,
                    titre: articles.titre,
                    image: articles.image,
                })
                .from(articles)
                .where(isNotNull(articles.image)),
            db
                .select({
                    id: evenements.id,
                    titre: evenements.titre,
                    image: evenements.image,
                })
                .from(evenements)
                .where(isNotNull(evenements.image)),
        ]);

    const index = new Map<string, StorageUsage>();
    for (const livre of livresRows) {
        if (livre.image)
            index.set(livre.image, {
                type: 'livre',
                label: livre.titre ?? 'Livre sans titre',
                href: `/admin/livres/${livre.id}/modifier`,
            });
    }
    for (const plante of plantesRows) {
        if (plante.image)
            index.set(plante.image, {
                type: 'bouture',
                label: plante.nom,
                href: `/admin/boutures/${plante.id}/modifier`,
            });
    }
    for (const article of articlesRows) {
        if (article.image)
            index.set(article.image, {
                type: 'article',
                label: article.titre,
                href: `/admin/blog/${article.id}/modifier`,
            });
    }
    for (const evenement of evenementsRows) {
        if (evenement.image)
            index.set(evenement.image, {
                type: 'evenement',
                label: evenement.titre,
                href: `/admin/evenements/${evenement.id}/modifier`,
            });
    }
    return index;
}

export async function isUrlInUse(url: string): Promise<boolean> {
    const index = await buildUsageIndex();
    return index.has(url);
}

export async function getStorageOverview(): Promise<{
    items: StorageItem[];
    totalBytes: number;
    quotaBytes: number;
}> {
    const [objects, usageIndex] = await Promise.all([
        listAllObjects(),
        buildUsageIndex(),
    ]);

    const items: StorageItem[] = [];
    for (const object of objects) {
        if (!object.name) continue; // entrée "prefix" (non utilisée en mode recursive)
        const url = `/api/images/${object.name}`;
        items.push({
            key: object.name,
            folder: object.name.split('/')[0] ?? object.name,
            url,
            sizeBytes: object.size,
            lastModified: object.lastModified,
            usedBy: usageIndex.get(url) ?? null,
            heavy: object.size > HEAVY_THRESHOLD_BYTES,
        });
    }
    items.sort((a, b) => b.sizeBytes - a.sizeBytes);

    const totalBytes = items.reduce((sum, item) => sum + item.sizeBytes, 0);

    return { items, totalBytes, quotaBytes: STORAGE_QUOTA_BYTES };
}
