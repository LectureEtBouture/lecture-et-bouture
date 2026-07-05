'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { BUCKET, minioClient } from '@/lib/minio';
import { isUrlInUse } from '@/lib/queries/storage';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!['admin', 'super_admin'].includes(session?.user?.role ?? ''))
        redirect('/admin/login');
}

export async function deleteStorageObject(
    key: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    await requireAdmin();

    const url = `/api/images/${key}`;
    if (await isUrlInUse(url)) {
        return {
            ok: false,
            error: 'Ce fichier est utilisé par une fiche — suppression refusée.',
        };
    }

    await minioClient.removeObject(BUCKET, key);
    await createLog({
        action: 'stockage.delete',
        entityType: 'stockage',
        entityLabel: key,
    });
    revalidatePath('/admin/stockage');

    return { ok: true };
}
