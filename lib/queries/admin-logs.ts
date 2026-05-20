import { db } from '@/db';
import { adminLogs } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function getAdminLogs() {
    return db.select().from(adminLogs).orderBy(desc(adminLogs.createdAt));
}
