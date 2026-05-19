'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { evenements } from '@/db/schema';
import { eq, gte, lt, asc, desc } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

const evenementSchema = z.object({
    titre: z.string().min(1),
    description: z.string().optional(),
    lieu: z.string().optional(),
    dateDebut: z.string().min(1),
    dateFin: z.string().optional(),
});

function parseFormData(formData: FormData) {
    const raw = evenementSchema.parse({
        titre: formData.get('titre'),
        description: formData.get('description') || undefined,
        lieu: formData.get('lieu') || undefined,
        dateDebut: formData.get('dateDebut'),
        dateFin: formData.get('dateFin') || undefined,
    });
    return {
        ...raw,
        dateDebut: new Date(raw.dateDebut),
        dateFin: raw.dateFin ? new Date(raw.dateFin) : null,
    };
}

export async function createEvenement(formData: FormData) {
    await requireAdmin();
    const parsed = parseFormData(formData);
    await db.insert(evenements).values({
        titre: parsed.titre,
        description: parsed.description ?? null,
        lieu: parsed.lieu ?? null,
        dateDebut: parsed.dateDebut,
        dateFin: parsed.dateFin ?? null,
    });
    revalidatePath('/admin/evenements');
    redirect('/admin/evenements');
}

export async function updateEvenement(id: number, formData: FormData) {
    await requireAdmin();
    const parsed = parseFormData(formData);
    await db
        .update(evenements)
        .set({
            titre: parsed.titre,
            description: parsed.description ?? null,
            lieu: parsed.lieu ?? null,
            dateDebut: parsed.dateDebut,
            dateFin: parsed.dateFin ?? null,
            updatedAt: new Date(),
        })
        .where(eq(evenements.id, id));
    revalidatePath('/admin/evenements');
    redirect('/admin/evenements');
}

export async function deleteEvenement(id: number) {
    await requireAdmin();
    await db.delete(evenements).where(eq(evenements.id, id));
    revalidatePath('/admin/evenements');
}

export async function getEvenements() {
    return db.select().from(evenements).orderBy(asc(evenements.dateDebut));
}

export async function getEvenement(id: number) {
    return db
        .select()
        .from(evenements)
        .where(eq(evenements.id, id))
        .limit(1)
        .then((r) => r[0]);
}

export async function getProchainEvenements(limit = 5) {
    return db
        .select()
        .from(evenements)
        .where(gte(evenements.dateDebut, new Date()))
        .orderBy(asc(evenements.dateDebut))
        .limit(limit);
}

export async function getPastEvenements() {
    return db
        .select()
        .from(evenements)
        .where(lt(evenements.dateDebut, new Date()))
        .orderBy(desc(evenements.dateDebut))
        .limit(3);
}
