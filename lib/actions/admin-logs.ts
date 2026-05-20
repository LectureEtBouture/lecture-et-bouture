'use server';

import { db } from '@/db';
import { adminLogs } from '@/db/schema';
import { auth } from '@/auth';
import { sql } from 'drizzle-orm';

const FIFO_LIMIT = 200;

export async function createLog(params: {
    action: string;
    entityType?: string;
    entityId?: string;
    entityLabel?: string;
}) {
    const session = await auth();
    if (!session?.user?.email) return;

    await db.insert(adminLogs).values({
        userId: session.user.id ?? null,
        userEmail: session.user.email,
        action: params.action,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null,
        entityLabel: params.entityLabel ?? null,
    });

    await db.execute(
        sql`DELETE FROM admin_logs WHERE id NOT IN (
            SELECT id FROM admin_logs ORDER BY created_at DESC LIMIT ${FIFO_LIMIT}
        )`,
    );
}
