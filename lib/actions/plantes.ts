'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { plantes } from '@/db/schema';
import { eq, asc, desc, and, SQL } from 'drizzle-orm';
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
    noteDeLaLibrairie: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    difficulte: z.enum(['facile', 'moyen', 'difficile']).optional(),
    lumiere: z
        .enum(['ombre', 'mi-ombre', 'lumiere-vive', 'plein-soleil'])
        .optional(),
    arrosage: z.enum(['rare', 'modere', 'regulier', 'abondant']).optional(),
    stock: z.coerce.number().int().min(0).default(0),
    choixLibrairie: z.boolean().default(false),
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
        noteDeLaLibrairie: formData.get('noteDeLaLibrairie') || undefined,
        image: formData.get('image') || undefined,
        imageAlt: formData.get('imageAlt') || undefined,
        difficulte: formData.get('difficulte') || undefined,
        lumiere: formData.get('lumiere') || undefined,
        arrosage: formData.get('arrosage') || undefined,
        stock: formData.get('stock') ?? 0,
        choixLibrairie: formData.get('choixLibrairie') === 'on',
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
        espece: parsed.espece ?? null,
        famille: parsed.famille ?? null,
        description: parsed.description ?? null,
        conseilsEntretien: parsed.conseilsEntretien ?? null,
        noteDeLaLibrairie: parsed.noteDeLaLibrairie ?? null,
        image: parsed.image ?? null,
        imageAlt: parsed.imageAlt ?? null,
        difficulte: parsed.difficulte ?? null,
        lumiere: parsed.lumiere ?? null,
        arrosage: parsed.arrosage ?? null,
    });

    revalidatePath('/admin/boutures');
    revalidateTag('boutures', { expire: 0 });
    redirect('/admin/boutures');
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
        noteDeLaLibrairie: formData.get('noteDeLaLibrairie') || undefined,
        image: formData.get('image') || undefined,
        imageAlt: formData.get('imageAlt') || undefined,
        difficulte: formData.get('difficulte') || undefined,
        lumiere: formData.get('lumiere') || undefined,
        arrosage: formData.get('arrosage') || undefined,
        stock: formData.get('stock') ?? 0,
        choixLibrairie: formData.get('choixLibrairie') === 'on',
    });

    await db
        .update(plantes)
        .set({
            ...parsed,
            prix: String(parsed.prix),
            espece: parsed.espece ?? null,
            famille: parsed.famille ?? null,
            description: parsed.description ?? null,
            conseilsEntretien: parsed.conseilsEntretien ?? null,
            noteDeLaLibrairie: parsed.noteDeLaLibrairie ?? null,
            image: parsed.image ?? null,
            imageAlt: parsed.imageAlt ?? null,
            difficulte: parsed.difficulte ?? null,
            lumiere: parsed.lumiere ?? null,
            arrosage: parsed.arrosage ?? null,
            updatedAt: new Date(),
        })
        .where(eq(plantes.id, id));

    revalidatePath('/admin/boutures');
    revalidateTag('boutures', { expire: 0 });
    redirect('/admin/boutures');
}

export async function deletePlante(id: number) {
    await requireAdmin();
    await db.delete(plantes).where(eq(plantes.id, id));
    revalidatePath('/admin/boutures');
    revalidateTag('boutures', { expire: 0 });
}

export async function updateStock(id: number, stock: number) {
    await requireAdmin();
    await db
        .update(plantes)
        .set({ stock, updatedAt: new Date() })
        .where(eq(plantes.id, id));
    revalidatePath('/admin/boutures');
    revalidateTag('boutures', { expire: 0 });
}

export type PlantesSort = 'nom' | 'prix' | 'difficulte' | 'stock' | 'recent';
export type PlantesFilter = {
    choix?: boolean;
    difficulte?: 'facile' | 'moyen' | 'difficile';
};

export async function getPlantes(
    sort: PlantesSort = 'recent',
    filter: PlantesFilter = {},
) {
    const order =
        sort === 'nom'
            ? asc(plantes.nom)
            : sort === 'prix'
              ? asc(plantes.prix)
              : sort === 'difficulte'
                ? asc(plantes.difficulte)
                : sort === 'stock'
                  ? asc(plantes.stock)
                  : desc(plantes.createdAt);

    const conditions: SQL[] = [];
    if (filter.choix) conditions.push(eq(plantes.choixLibrairie, true));
    if (filter.difficulte)
        conditions.push(eq(plantes.difficulte, filter.difficulte));

    const query = db
        .select({
            id: plantes.id,
            slug: plantes.slug,
            nom: plantes.nom,
            espece: plantes.espece,
            famille: plantes.famille,
            prix: plantes.prix,
            difficulte: plantes.difficulte,
            lumiere: plantes.lumiere,
            arrosage: plantes.arrosage,
            choixLibrairie: plantes.choixLibrairie,
            stock: plantes.stock,
            noteMoyenne: plantes.noteMoyenne,
            createdAt: plantes.createdAt,
        })
        .from(plantes)
        .orderBy(order);

    if (conditions.length > 0) {
        return query.where(and(...conditions));
    }
    return query;
}

export async function getPlante(id: number) {
    return db
        .select()
        .from(plantes)
        .where(eq(plantes.id, id))
        .limit(1)
        .then((r) => r[0]);
}
