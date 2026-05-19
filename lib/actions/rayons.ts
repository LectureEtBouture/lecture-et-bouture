'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { rayons } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

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

const rayonSchema = z.object({
    nom: z.string().min(1),
    description: z.string().optional(),
});

export async function getRayonsList() {
    return db.select().from(rayons).orderBy(asc(rayons.nom));
}

export async function getRayon(id: number) {
    return db
        .select()
        .from(rayons)
        .where(eq(rayons.id, id))
        .limit(1)
        .then((rows) => rows[0] ?? null);
}

export async function createRayon(formData: FormData) {
    await requireAdmin();
    const data = rayonSchema.parse({
        nom: formData.get('nom'),
        description: formData.get('description') || undefined,
    });
    await db.insert(rayons).values({
        nom: data.nom,
        slug: makeSlug(data.nom),
        description: data.description ?? null,
    });
    revalidatePath('/admin/rayons');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/rayons');
}

export async function updateRayon(id: number, formData: FormData) {
    await requireAdmin();
    const data = rayonSchema.parse({
        nom: formData.get('nom'),
        description: formData.get('description') || undefined,
    });
    await db
        .update(rayons)
        .set({
            nom: data.nom,
            slug: makeSlug(data.nom),
            description: data.description ?? null,
        })
        .where(eq(rayons.id, id));
    revalidatePath('/admin/rayons');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/rayons');
}

export async function deleteRayon(id: number) {
    await requireAdmin();
    await db.delete(rayons).where(eq(rayons.id, id));
    revalidatePath('/admin/rayons');
    revalidateTag('livres', { expire: 0 });
}
