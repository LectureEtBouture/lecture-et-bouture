'use server';

import { revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { auteursBlog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';

async function requireEditor() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

function invalidate() {
    revalidateTag('auteurs-blog', { expire: 0 });
}

export async function createAuteurBlog(formData: FormData) {
    await requireEditor();
    const nom = (formData.get('nom') as string)?.trim() ?? '';
    if (!nom) return;
    await db.insert(auteursBlog).values({ nom }).onConflictDoNothing();
    invalidate();
}

export async function updateAuteurBlog(id: string, formData: FormData) {
    await requireEditor();
    const nom = (formData.get('nom') as string)?.trim() ?? '';
    if (!nom) return;
    await db.update(auteursBlog).set({ nom }).where(eq(auteursBlog.id, id));
    invalidate();
    redirect('/admin/blog/auteurs');
}

export async function deleteAuteurBlog(id: string) {
    await requireEditor();
    await db.delete(auteursBlog).where(eq(auteursBlog.id, id));
    invalidate();
}
