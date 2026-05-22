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

export async function createAuteurBlog(formData: FormData) {
    await requireEditor();
    const nom = (formData.get('nom') as string) ?? '';
    await db.insert(auteursBlog).values({ nom });
    revalidateTag('auteurs-blog', 'max');
}

export async function deleteAuteurBlog(id: string) {
    await requireEditor();
    await db.delete(auteursBlog).where(eq(auteursBlog.id, id));
    revalidateTag('auteurs-blog', 'max');
}
