'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { selections, selectionItems, livres, plantes } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

const selectionSchema = z.object({
    titre: z.string().min(1),
    description: z.string().optional(),
    ordre: z.coerce.number().default(0),
    active: z.boolean().default(true),
});

export async function createSelection(formData: FormData) {
    await requireAdmin();

    const parsed = selectionSchema.parse({
        titre: formData.get('titre'),
        description: formData.get('description') || undefined,
        ordre: formData.get('ordre') || 0,
        active: formData.get('active') === 'on',
    });

    await db.insert(selections).values(parsed);
    revalidatePath('/admin/selections');
    redirect('/admin/selections');
}

export async function updateSelection(id: number, formData: FormData) {
    await requireAdmin();

    const parsed = selectionSchema.parse({
        titre: formData.get('titre'),
        description: formData.get('description') || undefined,
        ordre: formData.get('ordre') || 0,
        active: formData.get('active') === 'on',
    });

    await db
        .update(selections)
        .set({ ...parsed, updatedAt: new Date() })
        .where(eq(selections.id, id));

    revalidatePath('/admin/selections');
    redirect('/admin/selections');
}

export async function deleteSelection(id: number) {
    await requireAdmin();
    await db.delete(selections).where(eq(selections.id, id));
    revalidatePath('/admin/selections');
}

export async function addSelectionItem(
    selectionId: number,
    type: 'livre' | 'plante',
    itemId: number,
    ordre: number,
) {
    await requireAdmin();

    await db.insert(selectionItems).values({
        selectionId,
        type,
        livreId: type === 'livre' ? itemId : null,
        planteId: type === 'plante' ? itemId : null,
        ordre,
    });

    revalidatePath('/admin/selections');
}

export async function removeSelectionItem(itemId: number) {
    await requireAdmin();
    await db.delete(selectionItems).where(eq(selectionItems.id, itemId));
    revalidatePath('/admin/selections');
}

export async function getSelections() {
    return db
        .select()
        .from(selections)
        .orderBy(asc(selections.ordre), asc(selections.createdAt));
}

export async function getSelectionWithItems(id: number) {
    const selection = await db
        .select()
        .from(selections)
        .where(eq(selections.id, id))
        .limit(1)
        .then((r) => r[0]);

    const items = await db
        .select({
            id: selectionItems.id,
            type: selectionItems.type,
            ordre: selectionItems.ordre,
            livreId: selectionItems.livreId,
            planteId: selectionItems.planteId,
            livreTitre: livres.titre,
            planteNom: plantes.nom,
        })
        .from(selectionItems)
        .leftJoin(livres, eq(selectionItems.livreId, livres.id))
        .leftJoin(plantes, eq(selectionItems.planteId, plantes.id))
        .where(eq(selectionItems.selectionId, id))
        .orderBy(asc(selectionItems.ordre));

    return { selection, items };
}
