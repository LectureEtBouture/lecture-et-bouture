'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { livres, livresGenres } from '@/db/schema';
import { eq, desc, ilike, and, sql, SQL } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

const enrichissementSchema = z.object({
    inventaireUri: z.string().min(1),
    titre: z.string().optional(),
    rayonId: z.string().optional(),
    prix: z.coerce.number().positive().optional(),
    choixLibrairie: z.boolean().default(false),
    noteDeLaLibrairie: z.string().optional(),
    description: z.string().optional(),
    numeroSerie: z.coerce.number().int().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
});

function parseFormData(formData: FormData) {
    const parsed = enrichissementSchema.parse({
        inventaireUri: formData.get('inventaireUri'),
        titre: formData.get('titre') || undefined,
        rayonId: formData.get('rayonId') || undefined,
        prix: formData.get('prix') || undefined,
        choixLibrairie: formData.get('choixLibrairie') === 'on',
        noteDeLaLibrairie: formData.get('noteDeLaLibrairie') || undefined,
        description: formData.get('description') || undefined,
        numeroSerie: formData.get('numeroSerie') || undefined,
        image: formData.get('image') || undefined,
        imageAlt: formData.get('imageAlt') || undefined,
    });
    const genreIds = (formData.getAll('genreIds') as string[]).filter(
        (id) => id.length > 0,
    );
    return { ...parsed, genreIds };
}

export async function createLivre(formData: FormData) {
    await requireAdmin();
    const parsed = parseFormData(formData);

    const [{ id }] = await db
        .insert(livres)
        .values({
            inventaireUri: parsed.inventaireUri,
            titre: parsed.titre ?? null,
            rayonId: parsed.rayonId ?? null,
            prix: parsed.prix ? String(parsed.prix) : null,
            choixLibrairie: parsed.choixLibrairie,
            noteDeLaLibrairie: parsed.noteDeLaLibrairie ?? null,
            description: parsed.description ?? null,
            numeroSerie: parsed.numeroSerie ?? null,
            image: parsed.image ?? null,
            imageAlt: parsed.imageAlt ?? null,
        })
        .returning({ id: livres.id });

    if (parsed.genreIds.length > 0) {
        await db
            .insert(livresGenres)
            .values(
                parsed.genreIds.map((genreId) => ({ livreId: id, genreId })),
            );
    }

    await createLog({
        action: 'livre.create',
        entityType: 'livre',
        entityId: id,
        entityLabel: parsed.inventaireUri,
    });
    revalidatePath('/admin/livres');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/livres');
}

export async function updateLivre(id: string, formData: FormData) {
    await requireAdmin();
    const parsed = parseFormData(formData);

    await db
        .update(livres)
        .set({
            inventaireUri: parsed.inventaireUri,
            titre: parsed.titre ?? null,
            rayonId: parsed.rayonId ?? null,
            prix: parsed.prix ? String(parsed.prix) : null,
            choixLibrairie: parsed.choixLibrairie,
            noteDeLaLibrairie: parsed.noteDeLaLibrairie ?? null,
            description: parsed.description ?? null,
            numeroSerie: parsed.numeroSerie ?? null,
            image: parsed.image ?? null,
            imageAlt: parsed.imageAlt ?? null,
            updatedAt: new Date(),
        })
        .where(eq(livres.id, id));

    await db.delete(livresGenres).where(eq(livresGenres.livreId, id));
    if (parsed.genreIds.length > 0) {
        await db
            .insert(livresGenres)
            .values(
                parsed.genreIds.map((genreId) => ({ livreId: id, genreId })),
            );
    }

    await createLog({
        action: 'livre.update',
        entityType: 'livre',
        entityId: id,
        entityLabel: parsed.inventaireUri,
    });
    revalidatePath('/admin/livres');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/livres');
}

export async function deleteLivre(id: string) {
    await requireAdmin();
    const [row] = await db
        .select({ inventaireUri: livres.inventaireUri })
        .from(livres)
        .where(eq(livres.id, id))
        .limit(1);
    await db.delete(livres).where(eq(livres.id, id));
    await createLog({
        action: 'livre.delete',
        entityType: 'livre',
        entityId: id,
        entityLabel: row?.inventaireUri,
    });
    revalidatePath('/admin/livres');
    revalidateTag('livres', { expire: 0 });
}

export type LivresSort = 'recent' | 'choix';
export type LivresFilter = { search?: string; choix?: boolean };

export async function getLivres(
    sort: LivresSort = 'recent',
    filter: LivresFilter = {},
) {
    const conditions: SQL[] = [];
    if (filter.choix) conditions.push(eq(livres.choixLibrairie, true));
    if (filter.search) {
        conditions.push(ilike(livres.inventaireUri, `%${filter.search}%`));
    }

    return db
        .select({
            id: livres.id,
            inventaireUri: livres.inventaireUri,
            titre: livres.titre,
            prix: livres.prix,
            choixLibrairie: livres.choixLibrairie,
            noteMoyenne: livres.noteMoyenne,
            image: livres.image,
            createdAt: livres.createdAt,
        })
        .from(livres)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(
            sort === 'choix'
                ? eq(livres.choixLibrairie, true)
                : desc(livres.createdAt),
        );
}

export async function getLivre(id: string) {
    return db
        .select()
        .from(livres)
        .where(eq(livres.id, id))
        .limit(1)
        .then((r) => r[0]);
}
