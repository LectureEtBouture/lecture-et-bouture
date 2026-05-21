'use server';

import { db } from '@/db';
import { genres, rayons, livresGenres } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getGenres() {
    return db.select().from(genres).orderBy(genres.nom);
}

export async function getRayons() {
    return db.select().from(rayons).orderBy(rayons.nom);
}

export async function getLivreGenreIds(livreId: string): Promise<string[]> {
    const rows = await db
        .select({ genreId: livresGenres.genreId })
        .from(livresGenres)
        .where(eq(livresGenres.livreId, livreId));
    return rows.map((row) => row.genreId);
}
