# Pages éditoriales avec Tiptap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendre les pages éditoriales (concept, mentions légales, CGV, CGU, cookies, politique de confidentialité) gérables depuis le back-office via un éditeur rich text Tiptap.

**Architecture:** Table `pages_editoriales` (slug PK fixe, titre, contenu HTML, updatedAt). Le contenu est du HTML produit par Tiptap, stocké en DB, sanitisé côté serveur via `sanitize-html` avant rendu. Le set de pages est prédéfini — pas de création/suppression en BO, seulement édition.

**Tech Stack:** Tiptap (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`), `sanitize-html` + `@types/sanitize-html`, Drizzle ORM, Next.js 16 App Router Server Actions, `unstable_cache` avec tag `pages`.

---

## Conventions codebase (lire avant de coder)

- **Tokens Tailwind** : utiliser `text-primary`, `text-foreground`, `text-muted`, `border-border`, `bg-surface`, `bg-background`, `bg-primary`, `text-background`. Jamais de hex dans les classes.
- **Variables** : pas de lettre seule dans les callbacks. `(page)` pas `(p)`, `(row)` pas `(r)`.
- **Server Components par défaut** — `'use client'` seulement si hooks React ou event handlers.
- **`revalidateTag`** prend un second argument en Next.js 16 : `revalidateTag('pages', { expire: 0 })`.
- **Fichiers < 150 lignes**. Pages = orchestration uniquement.
- **HTML sanitization** : tout contenu HTML issu de la DB passe par `sanitizeRte()` avant rendu, même si admin-only.
- **Format commit** : `git commit -m "..."` suivi de `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>`.

---

## Structure des fichiers

**Créer :**

- `lib/sanitize.ts` — helper `sanitizeRte(html)` via `sanitize-html`
- `components/admin/RteField.tsx` — composant client Tiptap avec hidden input synchronisé
- `lib/queries/pages.ts` — query publique `getPageEditoriale` avec `unstable_cache`
- `lib/actions/pages.ts` — actions admin : `getPagesList`, `getPage`, `updatePage`
- `app/admin/(protected)/pages/page.tsx` — liste des pages éditoriales
- `app/admin/(protected)/pages/[slug]/modifier/page.tsx` — éditeur Tiptap

**Modifier :**

- `db/schema.ts` — ajouter `pagesEditoriales`
- `db/seed.ts` — ajouter seed des 6 pages avec contenu initial
- `app/globals.css` — ajouter class `.prose` pour le rendu HTML front
- `app/admin/(protected)/_components/AdminShell.tsx` — ajouter "Pages" dans nav
- `app/(front)/concept/page.tsx` — fetch depuis DB + rendu sanitisé
- `app/(front)/mentions-legales/page.tsx` — fetch depuis DB + rendu sanitisé
- `app/(front)/politique-de-confidentialite/page.tsx` — fetch depuis DB + rendu sanitisé
- `app/(front)/cgv/page.tsx` — fetch depuis DB + rendu sanitisé
- `app/(front)/cgu/page.tsx` — fetch depuis DB + rendu sanitisé
- `app/(front)/cookies/page.tsx` — fetch depuis DB + rendu sanitisé

---

## Task 1 : Installer les dépendances

**Files:**

- Modify: `package.json` (via npm)

- [ ] **Installer Tiptap + sanitize-html**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit sanitize-html
npm install --save-dev @types/sanitize-html
```

Attendu : pas d'erreur. Ces packages apparaissent dans `package.json`.

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install Tiptap and sanitize-html

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 2 : Ajouter `pagesEditoriales` au schema + migration

**Files:**

- Modify: `db/schema.ts`
- Create: `db/migrations/` (fichier généré)

- [ ] **Ajouter `pagesEditoriales` à la fin de `db/schema.ts`** (après le bloc `adminUsers`)

```ts
// ─── Pages éditoriales ────────────────────────────────────────────────────────

export const pagesEditoriales = pgTable('pages_editoriales', {
    slug: varchar('slug', { length: 100 }).primaryKey(),
    titre: varchar('titre', { length: 200 }).notNull(),
    contenu: text('contenu'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

- [ ] **Générer la migration** (nécessite la DB lancée)

```bash
npm run db:generate
```

Attendu : nouveau fichier `db/migrations/0004_*.sql` contenant :

```sql
CREATE TABLE "pages_editoriales" (
    "slug" varchar(100) PRIMARY KEY NOT NULL,
    "titre" varchar(200) NOT NULL,
    "contenu" text,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
```

- [ ] **Appliquer la migration**

```bash
npm run db:migrate
```

Attendu : pas d'erreur.

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

Attendu : `Types of parameters 'r' and 'value' are incompatible.` uniquement (pré-existant).

- [ ] **Commit**

```bash
git add db/schema.ts db/migrations/
git commit -m "feat: add pagesEditoriales schema and migration

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3 : Créer `lib/sanitize.ts`

**Files:**

- Create: `lib/sanitize.ts`

- [ ] **Créer `lib/sanitize.ts`**

Autorise uniquement les tags produits par Tiptap StarterKit : paragraphes, titres, listes, gras, italique, liens, blockquotes. Aucun attribut de style ou script.

```ts
import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
    'p',
    'h2',
    'h3',
    'strong',
    'em',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'br',
    'hr',
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions['allowedAttributes'] = {
    a: ['href', 'target', 'rel'],
};

export function sanitizeRte(html: string): string {
    return sanitizeHtml(html, {
        allowedTags: ALLOWED_TAGS,
        allowedAttributes: ALLOWED_ATTRIBUTES,
    });
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

- [ ] **Commit**

```bash
git add lib/sanitize.ts
git commit -m "feat: sanitizeRte helper using sanitize-html (allowlist Tiptap tags only)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4 : Ajouter `.prose` dans `globals.css`

**Files:**

- Modify: `app/globals.css`

- [ ] **Ajouter à la fin de `app/globals.css`**

```css
.prose {
    & h2 {
        @apply font-serif text-xl font-bold text-foreground mt-8 mb-4;
    }

    & h3 {
        @apply font-serif text-lg font-bold text-foreground mt-6 mb-3;
    }

    & p {
        @apply text-base leading-[1.75] max-w-[68ch] mb-4 text-foreground;
    }

    & ul {
        @apply list-disc pl-6 mb-4 space-y-1;
    }

    & ol {
        @apply list-decimal pl-6 mb-4 space-y-1;
    }

    & li {
        @apply text-base leading-[1.75] text-foreground;
    }

    & strong {
        @apply font-semibold;
    }

    & em {
        @apply italic;
    }

    & a {
        @apply underline underline-offset-4 hover:text-primary transition-colors;
    }

    & blockquote {
        @apply border-l border-border pl-6 italic text-muted my-4;
    }

    & p:last-child {
        @apply mb-0;
    }
}
```

- [ ] **Commit**

```bash
git add app/globals.css
git commit -m "feat: prose CSS class for Tiptap HTML rendering

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5 : Créer `lib/queries/pages.ts`

**Files:**

- Create: `lib/queries/pages.ts`

- [ ] **Créer `lib/queries/pages.ts`**

```ts
import { unstable_cache } from 'next/cache';
import { db } from '@/db';
import { pagesEditoriales } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const getPageEditoriale = unstable_cache(
    async (slug: string) =>
        db
            .select()
            .from(pagesEditoriales)
            .where(eq(pagesEditoriales.slug, slug))
            .limit(1)
            .then((rows) => rows[0] ?? null),
    ['page-editoriale'],
    { tags: ['pages'] },
);

export type PageEditoriale = Awaited<ReturnType<typeof getPageEditoriale>>;
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

- [ ] **Commit**

```bash
git add lib/queries/pages.ts
git commit -m "feat: public query getPageEditoriale with cache tag pages

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 6 : Créer `lib/actions/pages.ts`

**Files:**

- Create: `lib/actions/pages.ts`

- [ ] **Créer `lib/actions/pages.ts`**

```ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { pagesEditoriales } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { auth } from '@/auth';

async function requireAdmin() {
    const session = await auth();
    if (!session) redirect('/admin/login');
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
    revalidateTag('pages', { expire: 0 });
    revalidatePath(`/admin/pages/${slug}/modifier`);
    redirect('/admin/pages');
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

- [ ] **Commit**

```bash
git add lib/actions/pages.ts
git commit -m "feat: admin server actions for pages editoriales

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 7 : Créer `components/admin/RteField.tsx`

**Files:**

- Create: `components/admin/RteField.tsx`

- [ ] **Créer `components/admin/RteField.tsx`**

```tsx
'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef } from 'react';

function ToolbarButton({
    onClick,
    active,
    label,
    extraClass = '',
}: {
    onClick: () => void;
    active: boolean;
    label: string;
    extraClass?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-2 py-1 text-xs rounded-sm transition-colors ${
                active
                    ? 'bg-primary text-background'
                    : 'text-foreground hover:bg-background'
            } ${extraClass}`}
        >
            {label}
        </button>
    );
}

export function RteField({
    name,
    defaultValue = '',
}: {
    name: string;
    defaultValue?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: defaultValue,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            if (inputRef.current) {
                inputRef.current.value = editor.getHTML();
            }
        },
    });

    return (
        <div className="border border-border bg-surface">
            <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background">
                <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    active={editor?.isActive('bold') ?? false}
                    label="G"
                    extraClass="font-bold"
                />
                <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    active={editor?.isActive('italic') ?? false}
                    label="I"
                    extraClass="italic"
                />
                <ToolbarButton
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                    }
                    active={editor?.isActive('heading', { level: 2 }) ?? false}
                    label="H2"
                />
                <ToolbarButton
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                    }
                    active={editor?.isActive('heading', { level: 3 }) ?? false}
                    label="H3"
                />
                <ToolbarButton
                    onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                    }
                    active={editor?.isActive('bulletList') ?? false}
                    label="• Liste"
                />
                <ToolbarButton
                    onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                    }
                    active={editor?.isActive('orderedList') ?? false}
                    label="1. Liste"
                />
                <ToolbarButton
                    onClick={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                    }
                    active={editor?.isActive('blockquote') ?? false}
                    label="❝"
                />
            </div>
            <input
                ref={inputRef}
                type="hidden"
                name={name}
                defaultValue={defaultValue}
            />
            <EditorContent
                editor={editor}
                className="p-4 min-h-[300px] text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_h2]:font-serif [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:font-serif [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_blockquote]:border-l [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted"
            />
        </div>
    );
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

- [ ] **Commit**

```bash
git add components/admin/RteField.tsx
git commit -m "feat: RteField client component (Tiptap + hidden input for Server Actions)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 8 : Pages admin

**Files:**

- Create: `app/admin/(protected)/pages/page.tsx`
- Create: `app/admin/(protected)/pages/[slug]/modifier/page.tsx`

- [ ] **Créer les dossiers**

```bash
mkdir -p "app/admin/(protected)/pages/[slug]/modifier"
```

- [ ] **Créer `app/admin/(protected)/pages/page.tsx`**

```tsx
import Link from 'next/link';
import { getPagesList } from '@/lib/actions/pages';

const ROUTE_LABELS: Record<string, string> = {
    concept: 'Notre concept',
    'mentions-legales': 'Mentions légales',
    cgv: 'Conditions Générales de Vente',
    cgu: "Conditions Générales d'Utilisation",
    cookies: 'Politique de cookies',
    'politique-de-confidentialite': 'Politique de confidentialité',
};

export default async function AdminPagesPage() {
    const pages = await getPagesList();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Pages éditoriales
                </h1>
                <p className="text-[11px] text-muted mt-0.5">
                    {pages.length} page{pages.length > 1 ? 's' : ''}
                </p>
            </div>
            <div className="divide-y divide-border">
                {pages.map((page) => (
                    <div
                        key={page.slug}
                        className="flex items-center justify-between py-4"
                    >
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                {ROUTE_LABELS[page.slug] ?? page.titre}
                            </p>
                            <p className="text-xs text-muted font-mono mt-0.5">
                                /{page.slug}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span
                                className={`text-[10px] uppercase tracking-widest ${page.contenu ? 'text-primary' : 'text-muted'}`}
                            >
                                {page.contenu ? 'Rédigée' : 'Vide'}
                            </span>
                            <Link
                                href={`/admin/pages/${page.slug}/modifier`}
                                className="text-xs text-muted hover:text-primary transition-colors"
                            >
                                Modifier
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
```

- [ ] **Créer `app/admin/(protected)/pages/[slug]/modifier/page.tsx`**

```tsx
import { notFound } from 'next/navigation';
import { getPage, updatePage } from '@/lib/actions/pages';
import { RteField } from '@/components/admin/RteField';
import { labelClass } from '@/components/admin/formStyles';

type Props = { params: Promise<{ slug: string }> };

const ROUTE_LABELS: Record<string, string> = {
    concept: 'Notre concept',
    'mentions-legales': 'Mentions légales',
    cgv: 'Conditions Générales de Vente',
    cgu: "Conditions Générales d'Utilisation",
    cookies: 'Politique de cookies',
    'politique-de-confidentialite': 'Politique de confidentialité',
};

export default async function ModifierPagePage({ params }: Props) {
    const { slug } = await params;
    const page = await getPage(slug);
    if (!page) notFound();

    const action = updatePage.bind(null, page.slug);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    {ROUTE_LABELS[page.slug] ?? page.titre}
                </h1>
                <p className="text-[11px] text-muted font-mono mt-1">
                    /{page.slug}
                </p>
            </div>
            <form action={action} className="space-y-6">
                <div>
                    <label className={labelClass}>Contenu</label>
                    <RteField
                        name="contenu"
                        defaultValue={page.contenu ?? ''}
                    />
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                    >
                        Enregistrer
                    </button>
                    <a
                        href="/admin/pages"
                        className="px-6 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground transition-colors"
                    >
                        Annuler
                    </a>
                </div>
            </form>
        </div>
    );
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

- [ ] **Commit**

```bash
git add "app/admin/(protected)/pages/"
git commit -m "feat: admin pages editoriales — list + Tiptap editor

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 9 : Mettre à jour `AdminShell.tsx`

**Files:**

- Modify: `app/admin/(protected)/_components/AdminShell.tsx:7-15`

- [ ] **Ajouter "Pages" dans `navItems`**

Remplacer :

```ts
const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/livres', label: 'Livres' },
    { href: '/admin/boutures', label: 'Boutures' },
    { href: '/admin/genres', label: 'Genres' },
    { href: '/admin/rayons', label: 'Rayons' },
    { href: '/admin/avis', label: 'Avis' },
    { href: '/admin/evenements', label: 'Événements' },
    { href: '/admin/selections', label: 'Sélections' },
];
```

par :

```ts
const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/livres', label: 'Livres' },
    { href: '/admin/boutures', label: 'Boutures' },
    { href: '/admin/genres', label: 'Genres' },
    { href: '/admin/rayons', label: 'Rayons' },
    { href: '/admin/avis', label: 'Avis' },
    { href: '/admin/evenements', label: 'Événements' },
    { href: '/admin/selections', label: 'Sélections' },
    { href: '/admin/pages', label: 'Pages' },
];
```

- [ ] **Commit**

```bash
git add "app/admin/(protected)/_components/AdminShell.tsx"
git commit -m "feat: add Pages to admin nav

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 10 : Seeder les 6 pages dans `db/seed.ts`

**Files:**

- Modify: `db/seed.ts`

- [ ] **Ajouter `pagesEditoriales` dans l'import du schema** — remplacer :

```ts
import {
    genres,
    rayons,
    livres,
    plantes,
    avis,
    evenements,
    selections,
    selectionItems,
} from './schema';
```

par :

```ts
import {
    genres,
    rayons,
    livres,
    plantes,
    avis,
    evenements,
    selections,
    selectionItems,
    pagesEditoriales,
} from './schema';
```

- [ ] **Mettre à jour le TRUNCATE** — remplacer :

```ts
await db.execute(
    sql`TRUNCATE TABLE avis, selection_items, evenements, livres, plantes, selections, genres, rayons RESTART IDENTITY CASCADE`,
);
```

par :

```ts
await db.execute(
    sql`TRUNCATE TABLE avis, selection_items, evenements, livres, plantes, selections, genres, rayons RESTART IDENTITY CASCADE`,
);
await db.execute(sql`TRUNCATE TABLE pages_editoriales`);
```

- [ ] **Ajouter le seed des pages** — après le bloc sélections, avant `await client.end()` :

```ts
// Pages éditoriales
const conceptContenu =
    '<h2>Une librairie qui ne ressemble pas à une librairie</h2>' +
    "<p>Lecture &amp; Boutures est née d'une conviction simple : les livres et les plantes partagent la même exigence. Ils demandent du temps, de l'attention, un espace pour exister. Ils ne s'imposent pas — ils s'offrent à qui prend la peine de les choisir.</p>" +
    "<p>Notre boutique réunit ces deux mondes sous le même toit. Côté livres, une sélection soignée de titres académiques, de littérature de fond et d'essais qui méritent d'être lus lentement. Côté boutures, des spécimens rares choisis pour leur caractère, accompagnés de conseils d'entretien fiables.</p>" +
    '<h2>Le rôle du conservateur</h2>' +
    '<p>Chaque titre présent dans notre catalogue a été lu, tenu en mains, discuté. Notre équipe ne référence pas : elle sélectionne. Cette différence est notre engagement principal.</p>' +
    "<p>La « Sélection du conservateur » regroupe ce que nous aimons vraiment — des livres pour lesquels nous pouvons répondre en personne. Elle évolue selon les saisons, les lectures, les découvertes. Pas d'algorithme, pas de bestseller par défaut.</p>" +
    '<h2>La lenteur comme parti pris</h2>' +
    "<p>Nous avons conçu ce site pour qu'il ne ressemble pas à une boutique en ligne. Pas de compteurs, pas de promotions, pas d'urgence. Le visiteur qui s'attarde, qui revient, qui prend le temps de lire la fiche d'un livre avant de l'acheter — c'est lui que nous cherchons à accueillir.</p>" +
    "<p>L'achat se fait chez leslibraires.fr, plateforme qui soutient les librairies indépendantes. Nous ne gérons pas de stock en ligne, pas de panier, pas de paiement direct. Ce que nous gérons, c'est le choix.</p>";

const pagesInitiales = [
    { slug: 'concept', titre: 'Notre concept', contenu: conceptContenu },
    { slug: 'mentions-legales', titre: 'Mentions légales', contenu: null },
    {
        slug: 'cgv',
        titre: 'Conditions Générales de Vente',
        contenu: null,
    },
    {
        slug: 'cgu',
        titre: "Conditions Générales d'Utilisation",
        contenu: null,
    },
    { slug: 'cookies', titre: 'Politique de cookies', contenu: null },
    {
        slug: 'politique-de-confidentialite',
        titre: 'Politique de confidentialité',
        contenu: null,
    },
];

for (const pageData of pagesInitiales) {
    await db.insert(pagesEditoriales).values(pageData);
}
console.log(`Pages éditoriales : ${pagesInitiales.length}`);
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

- [ ] **Appliquer le seed** (nécessite DB lancée)

```bash
npm run db:seed
```

Attendu : `Pages éditoriales : 6` dans les logs.

- [ ] **Commit**

```bash
git add db/seed.ts
git commit -m "feat: seed 6 pages editoriales with initial concept content

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 11 : Mettre à jour les 6 pages front

**Files:**

- Modify: `app/(front)/concept/page.tsx`
- Modify: `app/(front)/mentions-legales/page.tsx`
- Modify: `app/(front)/politique-de-confidentialite/page.tsx`
- Modify: `app/(front)/cgv/page.tsx`
- Modify: `app/(front)/cgu/page.tsx`
- Modify: `app/(front)/cookies/page.tsx`

Les pages utilisent `getPageEditoriale` (public, cached), puis `sanitizeRte` avant rendu.

- [ ] **Remplacer `app/(front)/concept/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageEditoriale } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export const metadata: Metadata = {
    title: 'Notre concept',
    description:
        "Lecture & Boutures — l'alliance du livre académique et de la bouture végétale. Cultiver l'esprit, nourrir la terre.",
};

export default async function ConceptPage() {
    const page = await getPageEditoriale('concept');
    if (!page) notFound();

    return (
        <article className="max-w-2xl mx-auto px-6 py-section space-y-section">
            <header className="space-y-6">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    Notre philosophie
                </p>
                <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground leading-[1.05] tracking-[-0.02em]">
                    Cultiver l&rsquo;esprit,
                    <br />
                    nourrir la terre.
                </h1>
            </header>

            {page.contenu && (
                <div
                    className="prose border-t border-border pt-section"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeRte(page.contenu),
                    }}
                />
            )}
        </article>
    );
}
```

- [ ] **Remplacer `app/(front)/mentions-legales/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageEditoriale } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export const metadata: Metadata = {
    title: 'Mentions légales',
    robots: { index: false, follow: false },
};

export default async function MentionsLegalesPage() {
    const page = await getPageEditoriale('mentions-legales');
    if (!page) notFound();

    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Mentions légales
            </h1>
            {page.contenu ? (
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeRte(page.contenu),
                    }}
                />
            ) : (
                <p className="text-muted">Contenu à venir.</p>
            )}
        </section>
    );
}
```

- [ ] **Remplacer `app/(front)/politique-de-confidentialite/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageEditoriale } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export const metadata: Metadata = {
    title: 'Politique de confidentialité',
    robots: { index: false, follow: false },
};

export default async function PolitiqueConfidentialitePage() {
    const page = await getPageEditoriale('politique-de-confidentialite');
    if (!page) notFound();

    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Politique de confidentialité
            </h1>
            {page.contenu ? (
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeRte(page.contenu),
                    }}
                />
            ) : (
                <p className="text-muted">Contenu à venir.</p>
            )}
        </section>
    );
}
```

- [ ] **Remplacer `app/(front)/cgv/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageEditoriale } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export const metadata: Metadata = {
    title: 'Conditions Générales de Vente',
    robots: { index: false, follow: false },
};

export default async function CGVPage() {
    const page = await getPageEditoriale('cgv');
    if (!page) notFound();

    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Conditions Générales de Vente
            </h1>
            {page.contenu ? (
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeRte(page.contenu),
                    }}
                />
            ) : (
                <p className="text-muted">Contenu à venir.</p>
            )}
        </section>
    );
}
```

- [ ] **Remplacer `app/(front)/cgu/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageEditoriale } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation",
    robots: { index: false, follow: false },
};

export default async function CGUPage() {
    const page = await getPageEditoriale('cgu');
    if (!page) notFound();

    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Conditions Générales d&apos;Utilisation
            </h1>
            {page.contenu ? (
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeRte(page.contenu),
                    }}
                />
            ) : (
                <p className="text-muted">Contenu à venir.</p>
            )}
        </section>
    );
}
```

- [ ] **Remplacer `app/(front)/cookies/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPageEditoriale } from '@/lib/queries/pages';
import { sanitizeRte } from '@/lib/sanitize';

export const metadata: Metadata = {
    title: 'Politique de cookies',
    robots: { index: false, follow: false },
};

export default async function CookiesPage() {
    const page = await getPageEditoriale('cookies');
    if (!page) notFound();

    return (
        <section className="max-w-3xl mx-auto px-6 py-section">
            <h1 className="font-serif text-3xl text-primary mb-8">
                Politique de cookies
            </h1>
            {page.contenu ? (
                <div
                    className="prose"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeRte(page.contenu),
                    }}
                />
            ) : (
                <p className="text-muted">Contenu à venir.</p>
            )}
        </section>
    );
}
```

- [ ] **Vérifier TypeScript**

```bash
npx tsc --noEmit 2>&1 | grep -v "run-migrations" | grep -v "Property 'hash'"
```

- [ ] **Commit**

```bash
git add "app/(front)/concept/page.tsx" "app/(front)/mentions-legales/page.tsx" "app/(front)/politique-de-confidentialite/page.tsx" "app/(front)/cgv/page.tsx" "app/(front)/cgu/page.tsx" "app/(front)/cookies/page.tsx"
git commit -m "feat: front editorial pages fetch from DB, render sanitized HTML with .prose

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Vérification finale

- [ ] `npx tsc --noEmit` — zéro erreur (hors pré-existants)
- [ ] `npm run dev` — tester :
    - `/concept` — affiche le contenu HTML seedé avec `.prose` (3 sections H2 + paragraphes)
    - `/mentions-legales` — affiche "Contenu à venir."
    - `/admin/pages` — liste 6 pages, badge "Rédigée" sur concept, "Vide" sur les autres
    - `/admin/pages/concept/modifier` — éditeur Tiptap chargé avec le contenu existant, toolbar fonctionnelle
    - Modifier le texte → Enregistrer → retour `/admin/pages`
    - Recharger `/concept` → le nouveau contenu s'affiche
    - `/admin/pages/mentions-legales/modifier` → rédiger du contenu → Enregistrer → vérifier `/mentions-legales`
