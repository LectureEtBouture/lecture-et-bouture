'use server';

import { revalidateTag } from 'next/cache';
import { db } from '@/db';
import { tagsBlog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { slugify } from '@/lib/slugify';

export async function createTagBlog(formData: FormData) {
    const nom = (formData.get('nom') as string)?.trim();
    if (!nom) return;
    const slug =
        (formData.get('slug') as string)?.trim() || slugify(nom);
    await db.insert(tagsBlog).values({ nom, slug }).onConflictDoNothing();
    revalidateTag('tags-blog', { expire: 0 });
}

export async function deleteTagBlog(id: string) {
    await db.delete(tagsBlog).where(eq(tagsBlog.id, id));
    revalidateTag('tags-blog', { expire: 0 });
}
