'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { livres, genres, rayons } from '@/db/schema';
import { eq, asc, desc, ilike, and, SQL } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

function makeSlug(titre: string) {
    return titre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

const livreSchema = z.object({
    titre: z.string().min(1),
    auteur: z.string().min(1),
    isbn: z.string().optional(),
    genreId: z.coerce.number().optional(),
    rayonId: z.coerce.number().optional(),
    editeur: z.string().optional(),
    collection: z.string().optional(),
    format: z.string().optional(),
    edition: z.string().optional(),
    anneePublication: z.coerce.number().int().optional(),
    serie: z.string().optional(),
    numeroSerie: z.coerce.number().int().optional(),
    prix: z.coerce.number().positive(),
    description: z.string().optional(),
    image: z.string().optional(),
    stock: z.coerce.number().int().min(0).default(0),
    choixLibrairie: z.boolean().default(false),
    noteDeLaLibrairie: z.string().optional(),
});

function parseFormData(formData: FormData) {
    return livreSchema.parse({
        titre: formData.get('titre'),
        auteur: formData.get('auteur'),
        isbn: formData.get('isbn') || undefined,
        genreId: formData.get('genreId') || undefined,
        rayonId: formData.get('rayonId') || undefined,
        editeur: formData.get('editeur') || undefined,
        collection: formData.get('collection') || undefined,
        format: formData.get('format') || undefined,
        edition: formData.get('edition') || undefined,
        anneePublication: formData.get('anneePublication') || undefined,
        serie: formData.get('serie') || undefined,
        numeroSerie: formData.get('numeroSerie') || undefined,
        prix: formData.get('prix'),
        description: formData.get('description') || undefined,
        image: formData.get('image') || undefined,
        stock: formData.get('stock') ?? 0,
        choixLibrairie: formData.get('choixLibrairie') === 'on',
        noteDeLaLibrairie: formData.get('noteDeLaLibrairie') || undefined,
    });
}

export async function createLivre(formData: FormData) {
    await requireAdmin();
    const parsed = parseFormData(formData);
    const slug = makeSlug(parsed.titre);

    await db.insert(livres).values({
        ...parsed,
        slug,
        prix: String(parsed.prix),
        genreId: parsed.genreId ?? null,
        rayonId: parsed.rayonId ?? null,
        editeur: parsed.editeur ?? null,
        collection: parsed.collection ?? null,
        format: parsed.format ?? null,
        edition: parsed.edition ?? null,
        anneePublication: parsed.anneePublication ?? null,
        serie: parsed.serie ?? null,
        numeroSerie: parsed.numeroSerie ?? null,
        description: parsed.description ?? null,
        image: parsed.image ?? null,
        noteDeLaLibrairie: parsed.noteDeLaLibrairie ?? null,
    });

    revalidatePath('/admin/livres');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/livres');
}

export async function updateLivre(id: number, formData: FormData) {
    await requireAdmin();
    const parsed = parseFormData(formData);

    await db
        .update(livres)
        .set({
            ...parsed,
            prix: String(parsed.prix),
            genreId: parsed.genreId ?? null,
            rayonId: parsed.rayonId ?? null,
            editeur: parsed.editeur ?? null,
            collection: parsed.collection ?? null,
            format: parsed.format ?? null,
            edition: parsed.edition ?? null,
            anneePublication: parsed.anneePublication ?? null,
            serie: parsed.serie ?? null,
            numeroSerie: parsed.numeroSerie ?? null,
            description: parsed.description ?? null,
            image: parsed.image ?? null,
            noteDeLaLibrairie: parsed.noteDeLaLibrairie ?? null,
            updatedAt: new Date(),
        })
        .where(eq(livres.id, id));

    revalidatePath('/admin/livres');
    revalidateTag('livres', { expire: 0 });
    redirect('/admin/livres');
}

export async function deleteLivre(id: number) {
    await requireAdmin();
    await db.delete(livres).where(eq(livres.id, id));
    revalidatePath('/admin/livres');
    revalidateTag('livres', { expire: 0 });
}

export async function updateStock(id: number, stock: number) {
    await requireAdmin();
    await db
        .update(livres)
        .set({ stock, updatedAt: new Date() })
        .where(eq(livres.id, id));
    revalidatePath('/admin/livres');
    revalidateTag('livres', { expire: 0 });
}

export type LivresSort = 'titre' | 'auteur' | 'prix' | 'stock' | 'recent';
export type LivresFilter = { rayon?: string; choix?: boolean; search?: string };

export async function getLivres(
    sort: LivresSort = 'recent',
    filter: LivresFilter = {},
) {
    const order =
        sort === 'titre'
            ? asc(livres.titre)
            : sort === 'auteur'
              ? asc(livres.auteur)
              : sort === 'prix'
                ? asc(livres.prix)
                : sort === 'stock'
                  ? asc(livres.stock)
                  : desc(livres.createdAt);

    const conditions: SQL[] = [];
    if (filter.choix) conditions.push(eq(livres.choixLibrairie, true));
    if (filter.search)
        conditions.push(ilike(livres.titre, `%${filter.search}%`));
    if (filter.rayon) conditions.push(eq(rayons.nom, filter.rayon));

    const query = db
        .select({
            id: livres.id,
            slug: livres.slug,
            titre: livres.titre,
            auteur: livres.auteur,
            isbn: livres.isbn,
            prix: livres.prix,
            editeur: livres.editeur,
            format: livres.format,
            choixLibrairie: livres.choixLibrairie,
            stock: livres.stock,
            genreNom: genres.nom,
            rayonNom: rayons.nom,
            createdAt: livres.createdAt,
        })
        .from(livres)
        .leftJoin(genres, eq(livres.genreId, genres.id))
        .leftJoin(rayons, eq(livres.rayonId, rayons.id))
        .orderBy(order);

    if (conditions.length > 0) {
        return query.where(and(...conditions));
    }
    return query;
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

export async function getRayons() {
    return db.select().from(rayons).orderBy(rayons.nom);
}
