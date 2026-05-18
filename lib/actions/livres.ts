'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { livres, genres } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

const livreSchema = z.object({
    titre: z.string().min(1),
    auteur: z.string().min(1),
    isbn: z.string().optional(),
    genreId: z.coerce.number().optional(),
    prix: z.coerce.number().positive(),
    description: z.string().optional(),
});

export async function createLivre(formData: FormData) {
    await requireAdmin();

    const parsed = livreSchema.parse({
        titre: formData.get('titre'),
        auteur: formData.get('auteur'),
        isbn: formData.get('isbn') || undefined,
        genreId: formData.get('genreId') || undefined,
        prix: formData.get('prix'),
        description: formData.get('description') || undefined,
    });

    const slug = parsed.titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    await db.insert(livres).values({
        ...parsed,
        slug,
        prix: String(parsed.prix),
    });

    revalidatePath('/admin/livres');
    redirect('/admin/livres');
}

export async function updateLivre(id: number, formData: FormData) {
    await requireAdmin();

    const parsed = livreSchema.parse({
        titre: formData.get('titre'),
        auteur: formData.get('auteur'),
        isbn: formData.get('isbn') || undefined,
        genreId: formData.get('genreId') || undefined,
        prix: formData.get('prix'),
        description: formData.get('description') || undefined,
    });

    await db
        .update(livres)
        .set({ ...parsed, prix: String(parsed.prix), updatedAt: new Date() })
        .where(eq(livres.id, id));

    revalidatePath('/admin/livres');
    redirect('/admin/livres');
}

export async function deleteLivre(id: number) {
    await requireAdmin();
    await db.delete(livres).where(eq(livres.id, id));
    revalidatePath('/admin/livres');
}

export async function getLivres() {
    return db
        .select({
            id: livres.id,
            slug: livres.slug,
            titre: livres.titre,
            auteur: livres.auteur,
            prix: livres.prix,
            publishedAt: livres.publishedAt,
            createdAt: livres.createdAt,
        })
        .from(livres)
        .orderBy(livres.createdAt);
}

export async function getLivre(id: number) {
    return db
        .select()
        .from(livres)
        .where(eq(livres.id, id))
        .limit(1)
        .then((r) => r[0]);
}

export async function getGenres() {
    return db.select().from(genres).orderBy(genres.nom);
}
