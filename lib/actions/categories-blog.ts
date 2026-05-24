'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { categoriesBlog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { slugify } from '@/lib/slugify';
import { createLog } from './admin-logs';

async function requireEditor() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

export async function createCategorieBlog(formData: FormData) {
    await requireEditor();
    const nom = (formData.get('nom') as string) ?? '';
    const slug = (formData.get('slug') as string) || slugify(nom);
    const [row] = await db
        .insert(categoriesBlog)
        .values({ nom, slug })
        .returning({ id: categoriesBlog.id });
    await createLog({
        action: 'categorie-blog.create',
        entityType: 'categorie-blog',
        entityId: row.id,
        entityLabel: nom,
    });
    revalidateTag('categories-blog', { expire: 0 });
}

export async function updateCategorieBlog(id: string, formData: FormData) {
    await requireEditor();
    const nom = (formData.get('nom') as string) ?? '';
    const slug = (formData.get('slug') as string) || slugify(nom);
    await db
        .update(categoriesBlog)
        .set({ nom, slug })
        .where(eq(categoriesBlog.id, id));
    await createLog({
        action: 'categorie-blog.update',
        entityType: 'categorie-blog',
        entityId: id,
        entityLabel: nom,
    });
    revalidateTag('categories-blog', { expire: 0 });
}

export async function deleteCategorieBlog(id: string) {
    await requireEditor();
    const row = await db
        .select({ nom: categoriesBlog.nom })
        .from(categoriesBlog)
        .where(eq(categoriesBlog.id, id))
        .limit(1)
        .then((r) => r[0]);
    await db.delete(categoriesBlog).where(eq(categoriesBlog.id, id));
    await createLog({
        action: 'categorie-blog.delete',
        entityType: 'categorie-blog',
        entityId: id,
        entityLabel: row?.nom,
    });
    revalidateTag('categories-blog', { expire: 0 });
    revalidateTag('articles', { expire: 0 });
}
