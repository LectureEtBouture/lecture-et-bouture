'use server';

import { db } from '@/db';
import { parametres } from '@/db/schema';
import { revalidateTag } from 'next/cache';
import type {
    Horaires,
    Annonce,
    Maintenance,
    ReseauxSociaux,
    FermetureExceptionnelle,
} from '@/lib/types/parametres';

async function upsert(cle: string, valeur: unknown) {
    await db
        .insert(parametres)
        .values({ cle, valeur: JSON.stringify(valeur) })
        .onConflictDoUpdate({
            target: parametres.cle,
            set: { valeur: JSON.stringify(valeur), updatedAt: new Date() },
        });
    revalidateTag('parametres', { expire: 0 });
}

export async function sauvegarderHoraires(horaires: Horaires) {
    await upsert('horaires', horaires);
}

export async function sauvegarderFermetures(fermetures: FermetureExceptionnelle[]) {
    await upsert('fermetures', fermetures);
}

export async function sauvegarderAnnonce(annonce: Annonce) {
    await upsert('annonce', annonce);
}

export async function sauvegarderMaintenance(maintenance: Maintenance) {
    await upsert('maintenance', maintenance);
}

export async function sauvegarderReseaux(reseaux: ReseauxSociaux) {
    await upsert('reseaux_sociaux', reseaux);
}
