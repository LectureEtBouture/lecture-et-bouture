'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { selections, selectionItems, livres, plantes } from '@/db/schema';
import { eq, asc, count, sql, getTableColumns } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

const selectionSchema = z.object({
    titre: z.string().min(1),
    description: z.string().optional(),
    active: z.boolean().default(false),
});

export async function createSelection(formData: FormData) {
    await requireAdmin();
    const [{ count: existingCount }] = await db
        .select({ count: count() })
        .from(selections);
    const parsed = selectionSchema.parse({
        titre: formData.get('titre'),
        description: formData.get('description') || undefined,
        active: formData.get('active') === 'on',
    });
    await db.insert(selections).values({ ...parsed, ordre: existingCount });
    await createLog({
        action: 'selection.create',
        entityType: 'selection',
        entityLabel: parsed.titre,
    });
    revalidatePath('/admin/selections');
    revalidatePath('/selections');
    redirect('/admin/selections');
}

export async function updateSelection(id: string, formData: FormData) {
    await requireAdmin();
    const parsed = selectionSchema.parse({
        titre: formData.get('titre'),
        description: formData.get('description') || undefined,
        active: formData.get('active') === 'on',
    });
    await db
        .update(selections)
        .set({
            titre: parsed.titre,
            description: parsed.description,
            active: parsed.active,
            updatedAt: new Date(),
        })
        .where(eq(selections.id, id));
    await createLog({
        action: 'selection.update',
        entityType: 'selection',
        entityId: id,
        entityLabel: parsed.titre,
    });
    revalidatePath('/admin/selections');
    revalidatePath('/selections');
    redirect('/admin/selections');
}

export async function deleteSelection(id: string) {
    await requireAdmin();
    const row = await db
        .select({ titre: selections.titre })
        .from(selections)
        .where(eq(selections.id, id))
        .limit(1)
        .then((r) => r[0]);
    await db.delete(selections).where(eq(selections.id, id));
    await createLog({
        action: 'selection.delete',
        entityType: 'selection',
        entityId: id,
        entityLabel: row?.titre,
    });
    revalidatePath('/admin/selections');
    revalidatePath('/selections');
}

export async function toggleSelectionActive(id: string) {
    await requireAdmin();
    await db
        .update(selections)
        .set({ active: sql`NOT ${selections.active}`, updatedAt: new Date() })
        .where(eq(selections.id, id));
    revalidatePath('/admin/selections');
    revalidatePath('/selections');
}

export async function reorderSelections(orderedIds: string[]) {
    await requireAdmin();
    await Promise.all(
        orderedIds.map((id, index) =>
            db
                .update(selections)
                .set({ ordre: index })
                .where(eq(selections.id, id)),
        ),
    );
    revalidatePath('/admin/selections');
}

export async function addSelectionItem(
    selectionId: string,
    type: 'livre' | 'plante',
    itemId: string,
) {
    await requireAdmin();
    const [{ count: existingCount }] = await db
        .select({ count: count() })
        .from(selectionItems)
        .where(eq(selectionItems.selectionId, selectionId));
    await db.insert(selectionItems).values({
        selectionId,
        type,
        livreId: type === 'livre' ? itemId : null,
        planteId: type === 'plante' ? itemId : null,
        ordre: existingCount,
    });
    revalidatePath('/admin/selections');
    revalidatePath(`/admin/selections/${selectionId}`);
    revalidatePath('/selections');
}

export async function removeSelectionItem(selectionId: string, itemId: string) {
    await requireAdmin();
    await db.delete(selectionItems).where(eq(selectionItems.id, itemId));
    revalidatePath('/admin/selections');
    revalidatePath(`/admin/selections/${selectionId}`);
    revalidatePath('/selections');
}

export async function reorderSelectionItems(
    selectionId: string,
    orderedIds: string[],
) {
    await requireAdmin();
    await Promise.all(
        orderedIds.map((id, index) =>
            db
                .update(selectionItems)
                .set({ ordre: index })
                .where(eq(selectionItems.id, id)),
        ),
    );
    revalidatePath('/admin/selections');
    revalidatePath(`/admin/selections/${selectionId}`);
}

export async function getSelections() {
    return db
        .select({
            ...getTableColumns(selections),
            itemCount: count(selectionItems.id),
        })
        .from(selections)
        .leftJoin(selectionItems, eq(selectionItems.selectionId, selections.id))
        .groupBy(selections.id)
        .orderBy(asc(selections.ordre), asc(selections.createdAt));
}

export async function getSelectionById(id: string) {
    const rows = await db
        .select()
        .from(selections)
        .where(eq(selections.id, id))
        .limit(1);
    return rows[0] ?? null;
}

export async function getSelectionWithItems(id: string) {
    const rows = await db
        .select()
        .from(selections)
        .where(eq(selections.id, id))
        .limit(1);
    const selection = rows[0];

    const items = await db
        .select({
            id: selectionItems.id,
            type: selectionItems.type,
            ordre: selectionItems.ordre,
            livreId: selectionItems.livreId,
            planteId: selectionItems.planteId,
            livreUri: livres.inventaireUri,
            planteNom: plantes.nom,
        })
        .from(selectionItems)
        .leftJoin(livres, eq(selectionItems.livreId, livres.id))
        .leftJoin(plantes, eq(selectionItems.planteId, plantes.id))
        .where(eq(selectionItems.selectionId, id))
        .orderBy(asc(selectionItems.ordre));

    return { selection, items };
}
