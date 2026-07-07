'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { pagesEditoriales } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { z } from 'zod';
import { createLog } from './admin-logs';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
}

// Slugs déjà pris par des routes front statiques — une page créée avec l'un
// de ces slugs serait invisible (la route statique passe toujours avant).
const RESERVED_SLUGS = [
    'concept',
    'cgu',
    'cgv',
    'cookies',
    'mentions-legales',
    'politique-de-confidentialite',
    'livres',
    'boutures',
    'blog',
    'evenements',
    'contact',
    'ma-liste',
    'selections',
    'surprendre',
    'admin',
    'api',
];

// Pages que le front attend en dur (routes statiques app/(front)/<slug>/page.tsx
// + liens Navbar/Footer) mais que seul le script db:seed crée — absentes si
// db:seed n'a jamais tourné sur cet environnement (ex: prod bootstrappée via
// db:migrate uniquement).
const FIXED_PAGES = [
    { slug: 'concept', titre: 'Notre concept' },
    { slug: 'mentions-legales', titre: 'Mentions légales' },
    { slug: 'cgv', titre: 'Conditions Générales de Vente' },
    { slug: 'cgu', titre: "Conditions Générales d'Utilisation" },
    { slug: 'cookies', titre: 'Politique de cookies' },
    {
        slug: 'politique-de-confidentialite',
        titre: 'Politique de confidentialité',
    },
];

export async function getMissingFixedPages() {
    const existing = await db
        .select({ slug: pagesEditoriales.slug })
        .from(pagesEditoriales);
    const existingSlugs = new Set(existing.map((row) => row.slug));
    return FIXED_PAGES.filter((page) => !existingSlugs.has(page.slug));
}

export async function createMissingFixedPages() {
    await requireAdmin();
    const missing = await getMissingFixedPages();
    if (missing.length === 0) return;
    await db.insert(pagesEditoriales).values(
        missing.map((page) => ({
            slug: page.slug,
            titre: page.titre,
            contenu: null,
            publiee: false,
        })),
    );
    await createLog({
        action: 'page.create',
        entityType: 'page',
        entityLabel: `${missing.length} page(s) fixe(s) créée(s)`,
    });
    revalidateTag('pages', { expire: 0 });
    revalidatePath('/admin/pages');
}

const createPageSchema = z.object({
    titre: z.string().min(1),
    slug: z
        .string()
        .min(1)
        .regex(
            /^[a-z0-9]+(-[a-z0-9]+)*$/,
            'Slug invalide (minuscules, chiffres, tirets)',
        ),
});

export async function createPage(formData: FormData) {
    await requireAdmin();
    const parsed = createPageSchema.parse({
        titre: formData.get('titre'),
        slug: formData.get('slug'),
    });
    if (RESERVED_SLUGS.includes(parsed.slug)) {
        throw new Error('Ce slug est réservé à une route existante.');
    }
    const existing = await db
        .select({ slug: pagesEditoriales.slug })
        .from(pagesEditoriales)
        .where(eq(pagesEditoriales.slug, parsed.slug))
        .limit(1)
        .then((rows) => rows[0]);
    if (existing) {
        throw new Error('Ce slug existe déjà.');
    }
    await db.insert(pagesEditoriales).values({
        slug: parsed.slug,
        titre: parsed.titre,
        publiee: false,
    });
    await createLog({
        action: 'page.create',
        entityType: 'page',
        entityId: parsed.slug,
        entityLabel: parsed.titre,
    });
    revalidateTag('pages', { expire: 0 });
    revalidatePath('/admin/pages');
    redirect('/admin/pages');
}

export async function deletePage(slug: string) {
    await requireAdmin();
    if (RESERVED_SLUGS.includes(slug)) {
        throw new Error(
            'Cette page est liée à une route fixe du site, suppression impossible.',
        );
    }
    await db.delete(pagesEditoriales).where(eq(pagesEditoriales.slug, slug));
    await createLog({
        action: 'page.delete',
        entityType: 'page',
        entityId: slug,
        entityLabel: slug,
    });
    revalidateTag('pages', { expire: 0 });
    revalidatePath('/admin/pages');
    revalidatePath(`/${slug}`);
}

export async function getPagesList() {
    return db
        .select()
        .from(pagesEditoriales)
        .orderBy(asc(pagesEditoriales.slug));
}

export async function getPage(slug: string) {
    return db
        .select()
        .from(pagesEditoriales)
        .where(eq(pagesEditoriales.slug, slug))
        .limit(1)
        .then((rows) => rows[0] ?? null);
}

export async function updatePage(slug: string, formData: FormData) {
    await requireAdmin();
    const contenu = (formData.get('contenu') as string) || null;
    await db
        .update(pagesEditoriales)
        .set({ contenu, updatedAt: new Date() })
        .where(eq(pagesEditoriales.slug, slug));
    await createLog({
        action: 'page.update',
        entityType: 'page',
        entityId: slug,
        entityLabel: slug,
    });
    revalidateTag('pages', { expire: 0 });
    revalidatePath(`/admin/pages/${slug}/modifier`);
    redirect('/admin/pages');
}

export async function togglePagePubliee(slug: string) {
    await requireAdmin();
    const row = await db
        .select({ publiee: pagesEditoriales.publiee })
        .from(pagesEditoriales)
        .where(eq(pagesEditoriales.slug, slug))
        .limit(1)
        .then((r) => r[0]);
    if (!row) return;
    await db
        .update(pagesEditoriales)
        .set({ publiee: !row.publiee, updatedAt: new Date() })
        .where(eq(pagesEditoriales.slug, slug));
    revalidateTag('pages', { expire: 0 });
    revalidatePath('/admin/pages');
    revalidatePath(`/${slug}`);
}
