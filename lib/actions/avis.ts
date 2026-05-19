'use server';

import { revalidatePath, updateTag } from 'next/cache';
import { db } from '@/db';
import { avis, livres, plantes } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

export async function validerAvis(id: number) {
    await requireAdmin();
    await db
        .update(avis)
        .set({ approuve: true, masque: false })
        .where(eq(avis.id, id));
    updateTag('avis');
    revalidatePath('/admin/avis');
}

export async function masquerAvis(id: number) {
    await requireAdmin();
    await db.update(avis).set({ masque: true }).where(eq(avis.id, id));
    updateTag('avis');
    revalidatePath('/admin/avis');
}

export async function remettreEnLigneAvis(id: number) {
    await requireAdmin();
    await db.update(avis).set({ masque: false }).where(eq(avis.id, id));
    updateTag('avis');
    revalidatePath('/admin/avis');
}

export async function deleteAvis(id: number) {
    await requireAdmin();
    await db.delete(avis).where(eq(avis.id, id));
    updateTag('avis');
    revalidatePath('/admin/avis');
}

export type AvisSort =
    | 'date-desc'
    | 'date-asc'
    | 'note-desc'
    | 'note-asc'
    | 'type';

export async function getAvis(sort: AvisSort = 'date-desc') {
    const order =
        sort === 'date-asc'
            ? asc(avis.createdAt)
            : sort === 'note-desc'
              ? desc(avis.note)
              : sort === 'note-asc'
                ? asc(avis.note)
                : sort === 'type'
                  ? asc(avis.type)
                  : desc(avis.createdAt);

    return db
        .select({
            id: avis.id,
            type: avis.type,
            auteurNom: avis.auteurNom,
            note: avis.note,
            texte: avis.texte,
            approuve: avis.approuve,
            masque: avis.masque,
            produitNom: avis.produitNom,
            createdAt: avis.createdAt,
            livreId: avis.livreId,
            boutureId: avis.boutureId,
        })
        .from(avis)
        .orderBy(order);
}
