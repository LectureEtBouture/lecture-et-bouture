import { db } from '@/db';
import { evenements } from '@/db/schema';
import { and, asc, desc, eq, gt, gte, isNotNull, lt, lte } from 'drizzle-orm';

const publie = eq(evenements.publie, true);

export async function getEvenementsPublics() {
    return db
        .select()
        .from(evenements)
        .where(publie)
        .orderBy(asc(evenements.dateDebut));
}

export async function getProchainEvenements(limit = 5) {
    const now = new Date();
    return db
        .select()
        .from(evenements)
        .where(and(publie, gte(evenements.dateDebut, now)))
        .orderBy(asc(evenements.dateDebut))
        .limit(limit);
}

export async function getPastEvenements() {
    const now = new Date();
    return db
        .select()
        .from(evenements)
        .where(and(publie, lt(evenements.dateDebut, now)))
        .orderBy(desc(evenements.dateDebut))
        .limit(3);
}

export async function getEvenementMisEnAvant() {
    const now = new Date();

    const enCours = await db
        .select()
        .from(evenements)
        .where(
            and(
                publie,
                lte(evenements.dateDebut, now),
                isNotNull(evenements.dateFin),
                gt(evenements.dateFin, now),
            ),
        )
        .orderBy(asc(evenements.dateDebut))
        .limit(1);

    if (enCours.length) return { evenement: enCours[0], status: 'en_cours' as const };

    const prochain = await db
        .select()
        .from(evenements)
        .where(and(publie, gt(evenements.dateDebut, now)))
        .orderBy(asc(evenements.dateDebut))
        .limit(1);

    if (prochain.length) return { evenement: prochain[0], status: 'upcoming' as const };

    return null;
}
