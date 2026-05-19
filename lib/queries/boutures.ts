import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { plantes } from '@/db/schema';
import { eq, and, asc, desc, ilike, or, type SQL, sql } from 'drizzle-orm';

export type SortBoutures =
    | 'alpha'
    | 'prix-asc'
    | 'prix-desc'
    | 'note'
    | 'difficulte';

export interface BouturesFilters {
    difficulte?: string;
    lumiere?: string;
    arrosage?: string;
    sort?: SortBoutures;
    q?: string;
    choixLibrairie?: boolean;
}

const boutureSelect = {
    id: plantes.id,
    slug: plantes.slug,
    nom: plantes.nom,
    espece: plantes.espece,
    famille: plantes.famille,
    prix: plantes.prix,
    description: plantes.description,
    conseilsEntretien: plantes.conseilsEntretien,
    difficulte: plantes.difficulte,
    lumiere: plantes.lumiere,
    arrosage: plantes.arrosage,
    image: plantes.image,
    noteMoyenne: plantes.noteMoyenne,
    choixLibrairie: plantes.choixLibrairie,
    stock: plantes.stock,
    noteDeLaLibrairie: plantes.noteDeLaLibrairie,
} as const;

export type BouturePublique = Awaited<
    ReturnType<typeof getBouturesPubliques>
>[number];

function buildBoutureOrderBy(sort?: SortBoutures) {
    switch (sort) {
        case 'alpha':
            return asc(plantes.nom);
        case 'prix-asc':
            return asc(plantes.prix);
        case 'prix-desc':
            return desc(plantes.prix);
        case 'note':
            return desc(plantes.noteMoyenne);
        case 'difficulte':
            return sql`CASE ${plantes.difficulte} WHEN 'facile' THEN 0 WHEN 'moyen' THEN 1 WHEN 'difficile' THEN 2 ELSE 3 END`;
        default:
            return asc(plantes.nom);
    }
}

export const getBouturesPubliques = unstable_cache(
    async (filters: BouturesFilters = {}) => {
        const conditions: SQL[] = [];
        if (filters.difficulte)
            conditions.push(
                eq(
                    plantes.difficulte,
                    filters.difficulte as 'facile' | 'moyen' | 'difficile',
                ),
            );
        if (filters.lumiere)
            conditions.push(
                eq(
                    plantes.lumiere,
                    filters.lumiere as
                        | 'ombre'
                        | 'mi-ombre'
                        | 'lumiere-vive'
                        | 'plein-soleil',
                ),
            );
        if (filters.arrosage)
            conditions.push(
                eq(
                    plantes.arrosage,
                    filters.arrosage as
                        | 'rare'
                        | 'modere'
                        | 'regulier'
                        | 'abondant',
                ),
            );
        if (filters.choixLibrairie)
            conditions.push(eq(plantes.choixLibrairie, true));
        if (filters.q) {
            const pattern = `%${filters.q}%`;
            const searchCondition = or(
                ilike(plantes.nom, pattern),
                ilike(plantes.espece, pattern),
                ilike(plantes.famille, pattern),
            );
            if (searchCondition) conditions.push(searchCondition);
        }
        const query = db
            .select(boutureSelect)
            .from(plantes)
            .orderBy(buildBoutureOrderBy(filters.sort));
        return conditions.length > 0 ? query.where(and(...conditions)) : query;
    },
    ['boutures-publiques'],
    { tags: ['boutures'] },
);

export const getBoutureBySlug = unstable_cache(
    async (slug: string) =>
        db
            .select(boutureSelect)
            .from(plantes)
            .where(eq(plantes.slug, slug))
            .limit(1)
            .then((rows) => rows[0] ?? null),
    ['bouture-by-slug'],
    { tags: ['boutures'] },
);
