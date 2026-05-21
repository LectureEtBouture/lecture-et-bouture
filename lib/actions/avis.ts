'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { db } from '@/db';
import { avis, livres } from '@/db/schema';
import { eq, desc, asc } from 'drizzle-orm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

export async function validerAvis(id: string) {
    await requireAdmin();
    const row = await db
        .select({ auteurNom: avis.auteurNom })
        .from(avis)
        .where(eq(avis.id, id))
        .limit(1)
        .then((r) => r[0]);
    await db
        .update(avis)
        .set({ approuve: true, masque: false })
        .where(eq(avis.id, id));
    await createLog({
        action: 'avis.valider',
        entityType: 'avis',
        entityId: id,
        entityLabel: row?.auteurNom,
    });
    revalidateTag('avis', 'max');
    revalidatePath('/admin/avis');
}

export async function masquerAvis(id: string) {
    await requireAdmin();
    const row = await db
        .select({ auteurNom: avis.auteurNom })
        .from(avis)
        .where(eq(avis.id, id))
        .limit(1)
        .then((r) => r[0]);
    await db.update(avis).set({ masque: true }).where(eq(avis.id, id));
    await createLog({
        action: 'avis.masquer',
        entityType: 'avis',
        entityId: id,
        entityLabel: row?.auteurNom,
    });
    revalidateTag('avis', 'max');
    revalidatePath('/admin/avis');
}

export async function remettreEnLigneAvis(id: string) {
    await requireAdmin();
    const row = await db
        .select({ auteurNom: avis.auteurNom })
        .from(avis)
        .where(eq(avis.id, id))
        .limit(1)
        .then((r) => r[0]);
    await db.update(avis).set({ masque: false }).where(eq(avis.id, id));
    await createLog({
        action: 'avis.remettre_en_ligne',
        entityType: 'avis',
        entityId: id,
        entityLabel: row?.auteurNom,
    });
    revalidateTag('avis', 'max');
    revalidatePath('/admin/avis');
}

export async function deleteAvis(id: string) {
    await requireAdmin();
    const row = await db
        .select({ auteurNom: avis.auteurNom })
        .from(avis)
        .where(eq(avis.id, id))
        .limit(1)
        .then((r) => r[0]);
    await db.delete(avis).where(eq(avis.id, id));
    await createLog({
        action: 'avis.supprimer',
        entityType: 'avis',
        entityId: id,
        entityLabel: row?.auteurNom,
    });
    revalidateTag('avis', 'max');
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
            inventaireUri: livres.inventaireUri,
            createdAt: avis.createdAt,
            livreId: avis.livreId,
            boutureId: avis.boutureId,
        })
        .from(avis)
        .leftJoin(livres, eq(avis.livreId, livres.id))
        .orderBy(order);
}
