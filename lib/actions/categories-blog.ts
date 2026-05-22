'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { categoriesBlog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { slugify } from '@/lib/slugify';

async function requireEditor() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

export async function createCategorieBlog(formData: FormData) {
    await requireEditor();
    const nom = (formData.get('nom') as string) ?? '';
    const slug = (formData.get('slug') as string) || slugify(nom);
    await db.insert(categoriesBlog).values({ nom, slug });
    revalidateTag('categories-blog', 'max');
}

export async function updateCategorieBlog(id: string, formData: FormData) {
    await requireEditor();
    const nom = (formData.get('nom') as string) ?? '';
    const slug = (formData.get('slug') as string) || slugify(nom);
    await db
        .update(categoriesBlog)
        .set({ nom, slug })
        .where(eq(categoriesBlog.id, id));
    revalidateTag('categories-blog', 'max');
}

export async function deleteCategorieBlog(id: string) {
    await requireEditor();
    await db.delete(categoriesBlog).where(eq(categoriesBlog.id, id));
    revalidateTag('categories-blog', 'max');
    revalidateTag('articles', 'max');
}
