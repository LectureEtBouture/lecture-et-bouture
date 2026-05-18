'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { avis, livres, plantes } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

export async function approveAvis(id: number) {
    await requireAdmin();
    await db.update(avis).set({ approuve: true }).where(eq(avis.id, id));
    revalidatePath('/admin/avis');
}

export async function rejectAvis(id: number) {
    await requireAdmin();
    await db.update(avis).set({ approuve: false }).where(eq(avis.id, id));
    revalidatePath('/admin/avis');
}

export async function deleteAvis(id: number) {
    await requireAdmin();
    await db.delete(avis).where(eq(avis.id, id));
    revalidatePath('/admin/avis');
}

export async function getAvis() {
    const rows = await db
        .select({
            id: avis.id,
            type: avis.type,
            auteurNom: avis.auteurNom,
            note: avis.note,
            texte: avis.texte,
            approuve: avis.approuve,
            createdAt: avis.createdAt,
            livreId: avis.livreId,
            planteId: avis.planteId,
            livreTitre: livres.titre,
            planteNom: plantes.nom,
        })
        .from(avis)
        .leftJoin(livres, eq(avis.livreId, livres.id))
        .leftJoin(plantes, eq(avis.planteId, plantes.id))
        .orderBy(desc(avis.createdAt));

    return rows;
}
