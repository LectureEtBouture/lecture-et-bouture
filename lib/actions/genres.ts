'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { genres } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

function makeSlug(nom: string) {
    return nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const genreSchema = z.object({ nom: z.string().min(1) });

export async function getGenresList() {
    return db.select().from(genres).orderBy(asc(genres.nom));
}

export async function getGenre(id: string) {
    return db
        .select()
        .from(genres)
        .where(eq(genres.id, id))
        .limit(1)
        .then((rows) => rows[0] ?? null);
}

export async function createGenre(formData: FormData) {
    await requireAdmin();
    const { nom } = genreSchema.parse({ nom: formData.get('nom') });
    await db.insert(genres).values({ nom, slug: makeSlug(nom) });
    await createLog({ action: 'genre.create', entityType: 'genre', entityLabel: nom });
    revalidatePath('/admin/genres');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/genres');
}

export async function updateGenre(id: string, formData: FormData) {
    await requireAdmin();
    const { nom } = genreSchema.parse({ nom: formData.get('nom') });
    await db
        .update(genres)
        .set({ nom, slug: makeSlug(nom) })
        .where(eq(genres.id, id));
    await createLog({ action: 'genre.update', entityType: 'genre', entityId: id, entityLabel: nom });
    revalidatePath('/admin/genres');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/genres');
}

export async function deleteGenre(id: string) {
    await requireAdmin();
    const row = await db.select({ nom: genres.nom }).from(genres).where(eq(genres.id, id)).limit(1).then((r) => r[0]);
    await db.delete(genres).where(eq(genres.id, id));
    await createLog({ action: 'genre.delete', entityType: 'genre', entityId: id, entityLabel: row?.nom });
    revalidatePath('/admin/genres');
    revalidateTag('livres', { expire: 0 });
}
