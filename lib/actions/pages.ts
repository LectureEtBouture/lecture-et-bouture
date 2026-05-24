'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { pagesEditoriales } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

export async function getPagesList() {
    return db
        .select()
        .from(pagesEditoriales)
        .orderBy(asc(pagesEditoriales.slug));
}

export async function getPage(slug: string) {
    return db
        .select()
        .from(pagesEditoriales)
        .where(eq(pagesEditoriales.slug, slug))
        .limit(1)
        .then((rows) => rows[0] ?? null);
}

export async function updatePage(slug: string, formData: FormData) {
    await requireAdmin();
    const contenu = (formData.get('contenu') as string) || null;
    await db
        .update(pagesEditoriales)
        .set({ contenu, updatedAt: new Date() })
        .where(eq(pagesEditoriales.slug, slug));
    await createLog({
        action: 'page.update',
        entityType: 'page',
        entityId: slug,
        entityLabel: slug,
    });
    revalidateTag('pages', { expire: 0 });
    revalidatePath(`/admin/pages/${slug}/modifier`);
    redirect('/admin/pages');
}

export async function togglePagePubliee(slug: string) {
    await requireAdmin();
    const row = await db
        .select({ publiee: pagesEditoriales.publiee })
        .from(pagesEditoriales)
        .where(eq(pagesEditoriales.slug, slug))
        .limit(1)
        .then((r) => r[0]);
    if (!row) return;
    await db
        .update(pagesEditoriales)
        .set({ publiee: !row.publiee, updatedAt: new Date() })
        .where(eq(pagesEditoriales.slug, slug));
    revalidatePath('/admin/pages');
    revalidatePath(`/${slug}`);
}
