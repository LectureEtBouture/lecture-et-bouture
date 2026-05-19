import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { parametres } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type {
    Horaires,
    Annonce,
    Maintenance,
    ReseauxSociaux,
    FermetureExceptionnelle,
} from '@/lib/types/parametres';
import {
    HORAIRES_DEFAUT,
    ANNONCE_DEFAUT,
    MAINTENANCE_DEFAUT,
} from '@/lib/types/parametres';

async function fetchParametre(cle: string): Promise<string | null> {
    const rows = await db
        .select()
        .from(parametres)
        .where(eq(parametres.cle, cle))
        .limit(1);
    return rows[0]?.valeur ?? null;
}

export const getHoraires = unstable_cache(
    async (): Promise<Horaires> => {
        const raw = await fetchParametre('horaires');
        return raw ? (JSON.parse(raw) as Horaires) : HORAIRES_DEFAUT;
    },
    ['parametres-horaires'],
    { tags: ['parametres'] },
);

export const getFermetures = unstable_cache(
    async (): Promise<FermetureExceptionnelle[]> => {
        const raw = await fetchParametre('fermetures');
        return raw ? (JSON.parse(raw) as FermetureExceptionnelle[]) : [];
    },
    ['parametres-fermetures'],
    { tags: ['parametres'] },
);

export const getAnnonce = unstable_cache(
    async (): Promise<Annonce> => {
        const raw = await fetchParametre('annonce');
        return raw ? (JSON.parse(raw) as Annonce) : ANNONCE_DEFAUT;
    },
    ['parametres-annonce'],
    { tags: ['parametres'] },
);

export const getMaintenance = unstable_cache(
    async (): Promise<Maintenance> => {
        const raw = await fetchParametre('maintenance');
        return raw ? (JSON.parse(raw) as Maintenance) : MAINTENANCE_DEFAUT;
    },
    ['parametres-maintenance'],
    { tags: ['parametres'] },
);

export const getReseauxSociaux = unstable_cache(
    async (): Promise<ReseauxSociaux> => {
        const raw = await fetchParametre('reseaux_sociaux');
        return raw ? (JSON.parse(raw) as ReseauxSociaux) : [];
    },
    ['parametres-reseaux'],
    { tags: ['parametres'] },
);
