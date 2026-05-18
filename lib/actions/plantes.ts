'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { plantes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

const planteSchema = z.object({
    nom: z.string().min(1),
    espece: z.string().optional(),
    famille: z.string().optional(),
    prix: z.coerce.number().positive(),
    description: z.string().optional(),
    conseilsEntretien: z.string().optional(),
    difficulte: z.enum(['facile', 'moyen', 'difficile']).optional(),
    lumiere: z
        .enum(['ombre', 'mi-ombre', 'lumiere-vive', 'plein-soleil'])
        .optional(),
    arrosage: z.enum(['rare', 'modere', 'regulier', 'abondant']).optional(),
});

export async function createPlante(formData: FormData) {
    await requireAdmin();

    const parsed = planteSchema.parse({
        nom: formData.get('nom'),
        espece: formData.get('espece') || undefined,
        famille: formData.get('famille') || undefined,
        prix: formData.get('prix'),
        description: formData.get('description') || undefined,
        conseilsEntretien: formData.get('conseilsEntretien') || undefined,
        difficulte: formData.get('difficulte') || undefined,
        lumiere: formData.get('lumiere') || undefined,
        arrosage: formData.get('arrosage') || undefined,
    });

    const slug = parsed.nom
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    await db.insert(plantes).values({
        ...parsed,
        slug,
        prix: String(parsed.prix),
    });

    revalidatePath('/admin/plantes');
    redirect('/admin/plantes');
}

export async function updatePlante(id: number, formData: FormData) {
    await requireAdmin();

    const parsed = planteSchema.parse({
        nom: formData.get('nom'),
        espece: formData.get('espece') || undefined,
        famille: formData.get('famille') || undefined,
        prix: formData.get('prix'),
        description: formData.get('description') || undefined,
        conseilsEntretien: formData.get('conseilsEntretien') || undefined,
        difficulte: formData.get('difficulte') || undefined,
        lumiere: formData.get('lumiere') || undefined,
        arrosage: formData.get('arrosage') || undefined,
    });

    await db
        .update(plantes)
        .set({ ...parsed, prix: String(parsed.prix), updatedAt: new Date() })
        .where(eq(plantes.id, id));

    revalidatePath('/admin/plantes');
    redirect('/admin/plantes');
}

export async function deletePlante(id: number) {
    await requireAdmin();
    await db.delete(plantes).where(eq(plantes.id, id));
    revalidatePath('/admin/plantes');
}

export async function getPlantes() {
    return db
        .select({
            id: plantes.id,
            slug: plantes.slug,
            nom: plantes.nom,
            espece: plantes.espece,
            prix: plantes.prix,
            difficulte: plantes.difficulte,
            createdAt: plantes.createdAt,
        })
        .from(plantes)
        .orderBy(plantes.createdAt);
}

export async function getPlante(id: number) {
    return db
        .select()
        .from(plantes)
        .where(eq(plantes.id, id))
        .limit(1)
        .then((r) => r[0]);
}
