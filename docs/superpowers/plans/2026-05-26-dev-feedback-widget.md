# Dev Feedback Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un widget flottant dans l'admin permettant d'envoyer un bug/feedback/idée au développeur via Resend vers `DEVELOPPER_EMAIL`.

**Architecture:** Pill fixe `bottom-6 right-6` ouvre un popover avec sélecteur de type (Bug/Feedback/Idée) + textarea. Server action `envoyerFeedbackDev` lit `DEVELOPPER_EMAIL` et appelle `sendDevFeedbackEmail`. Widget absent si `DEVELOPPER_EMAIL` non défini.

**Tech Stack:** Next.js 16 server actions, Resend (fetch direct), Tailwind tokens, React useState

---

## File Map

| Action | Fichier                                                                              |
| ------ | ------------------------------------------------------------------------------------ |
| Modify | `services/resend.ts` — ajouter `sendDevFeedbackEmail`                                |
| Create | `lib/actions/dev-feedback.ts` — server action `envoyerFeedbackDev`                   |
| Create | `app/admin/(protected)/_components/AdminDevWidget.tsx` — widget complet              |
| Modify | `app/admin/(protected)/_components/AdminShell.tsx` — prop `devEmail` + render widget |
| Modify | `app/admin/(protected)/layout.tsx` — lire `DEVELOPPER_EMAIL` + passer à AdminShell   |

---

### Task 1 : `sendDevFeedbackEmail` dans services/resend.ts

**Files:**

- Modify: `services/resend.ts`

- [ ] **Step 1 : Ajouter le type et la fonction à la fin de `services/resend.ts`**

Ouvre `services/resend.ts`. Ajouter après la dernière fonction `sendContactEmail` :

```typescript
type DevFeedbackEmailData = {
    type: 'Bug' | 'Feedback' | 'Idée';
    message: string;
    fromEmail: string;
    devEmail: string;
};

export async function sendDevFeedbackEmail(data: DevFeedbackEmailData) {
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL,
            to: data.devEmail,
            subject: `[L&B Admin] ${data.type} — back-office`,
            text: `Type : ${data.type}\nDe : ${data.fromEmail}\n\n${data.message}`,
        }),
    });

    if (!res.ok) throw new Error(`Resend error: ${res.status}`);
}
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

Expected : aucune erreur liée à `services/resend.ts`.

- [ ] **Step 3 : Commit**

```bash
git add services/resend.ts
git commit -m "feat: add sendDevFeedbackEmail to resend service"
```

---

### Task 2 : Server action `envoyerFeedbackDev`

**Files:**

- Create: `lib/actions/dev-feedback.ts`

- [ ] **Step 1 : Créer le fichier**

```typescript
'use server';

import { auth } from '@/auth';
import { sendDevFeedbackEmail } from '@/services/resend';

export async function envoyerFeedbackDev(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error('Non autorisé');

    const type = formData.get('type') as 'Bug' | 'Feedback' | 'Idée';
    const message = (formData.get('message') as string)?.trim();
    const devEmail = process.env.DEVELOPPER_EMAIL;

    if (!devEmail) throw new Error('DEVELOPPER_EMAIL non défini');
    if (!message) throw new Error('Message vide');

    await sendDevFeedbackEmail({
        type,
        message,
        fromEmail: session.user?.email ?? 'inconnu',
        devEmail,
    });
}
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

Expected : aucune erreur liée à `lib/actions/dev-feedback.ts`.

- [ ] **Step 3 : Commit**

```bash
git add lib/actions/dev-feedback.ts
git commit -m "feat: add envoyerFeedbackDev server action"
```

---

### Task 3 : Composant `AdminDevWidget`

**Files:**

- Create: `app/admin/(protected)/_components/AdminDevWidget.tsx`

- [ ] **Step 1 : Créer le composant**

```tsx
'use client';

import { useState } from 'react';
import { envoyerFeedbackDev } from '@/lib/actions/dev-feedback';

type FeedbackType = 'Bug' | 'Feedback' | 'Idée';
type Status = 'idle' | 'loading' | 'success' | 'error';

const TYPES: FeedbackType[] = ['Bug', 'Feedback', 'Idée'];

export function AdminDevWidget() {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<FeedbackType>('Bug');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState<Status>('idle');
    const [toast, setToast] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');

        const formData = new FormData();
        formData.set('type', type);
        formData.set('message', message);

        try {
            await envoyerFeedbackDev(formData);
            setStatus('success');
            setToast(true);
            setTimeout(() => setToast(false), 3000);
            setTimeout(() => {
                setOpen(false);
                setStatus('idle');
                setMessage('');
                setType('Bug');
            }, 2000);
        } catch {
            setStatus('error');
        }
    }

    return (
        <>
            {toast && (
                <div className="fixed top-4 right-4 z-[60] bg-white border border-border px-4 py-3 shadow-sm text-sm text-foreground">
                    Message envoyé au développeur.
                </div>
            )}

            <div className="fixed bottom-6 right-6 z-50">
                {open && (
                    <div className="absolute bottom-12 right-0 w-[300px] bg-white border border-border shadow-sm">
                        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                            <p className="font-serif text-sm font-bold text-foreground">
                                Signaler un problème
                            </p>
                            <button
                                onClick={() => setOpen(false)}
                                className="text-muted hover:text-foreground transition-colors p-1"
                                aria-label="Fermer"
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 12 12"
                                    fill="none"
                                >
                                    <path
                                        d="M1 1L11 11M11 1L1 11"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </button>
                        </div>

                        {status === 'success' ? (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-foreground">
                                    ✓ Message envoyé.
                                </p>
                            </div>
                        ) : (
                            <form
                                onSubmit={handleSubmit}
                                className="p-4 space-y-4"
                            >
                                <div>
                                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium text-muted block mb-2">
                                        Type
                                    </span>
                                    <div className="flex gap-1.5">
                                        {TYPES.map((feedbackType) => (
                                            <button
                                                key={feedbackType}
                                                type="button"
                                                onClick={() =>
                                                    setType(feedbackType)
                                                }
                                                className={`px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors rounded-sm ${
                                                    type === feedbackType
                                                        ? 'bg-primary text-background'
                                                        : 'border border-border text-muted hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                {feedbackType}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] uppercase tracking-[0.12em] font-medium text-muted block mb-2">
                                        Message
                                    </span>
                                    <textarea
                                        value={message}
                                        onChange={(e) =>
                                            setMessage(e.target.value)
                                        }
                                        required
                                        rows={4}
                                        className="w-full border border-border bg-surface text-foreground px-[14px] py-[10px] text-sm rounded-sm focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>

                                {status === 'error' && (
                                    <p className="text-[11px] text-red-600">
                                        Erreur lors de l&rsquo;envoi. Réessayez.
                                    </p>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="bg-primary text-background px-6 py-2 text-[11px] uppercase tracking-[0.1em] font-medium transition-colors hover:bg-primary-light disabled:opacity-50"
                                    >
                                        {status === 'loading'
                                            ? 'Envoi…'
                                            : 'Envoyer →'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 px-3 py-2 bg-surface border border-border text-muted text-[11px] uppercase tracking-[0.1em] hover:border-primary hover:text-primary transition-colors shadow-sm rounded-sm"
                >
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <circle
                            cx="6.5"
                            cy="6.5"
                            r="5.5"
                            stroke="currentColor"
                            strokeWidth="1.4"
                        />
                        <path
                            d="M6.5 4.5V6.5M6.5 8.5H6.51"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                        />
                    </svg>
                    Signaler un problème
                </button>
            </div>
        </>
    );
}
```

- [ ] **Step 2 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

Expected : aucune erreur liée à `AdminDevWidget.tsx`.

- [ ] **Step 3 : Commit**

```bash
git add app/admin/\(protected\)/_components/AdminDevWidget.tsx
git commit -m "feat: add AdminDevWidget client component"
```

---

### Task 4 : Wiring — layout + AdminShell

**Files:**

- Modify: `app/admin/(protected)/layout.tsx`
- Modify: `app/admin/(protected)/_components/AdminShell.tsx`

- [ ] **Step 1 : Modifier `layout.tsx` pour passer `devEmail`**

Dans `app/admin/(protected)/layout.tsx`, ajouter `devEmail` au rendu de `AdminShell` :

```typescript
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { AdminShell } from './_components/AdminShell';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session) redirect('/admin/login');

    const signOutAction = async () => {
        'use server';
        await signOut({ redirectTo: '/admin/login' });
    };

    return (
        <AdminShell
            email={session.user?.email ?? ''}
            role={session.user?.role}
            signOutAction={signOutAction}
            devEmail={process.env.DEVELOPPER_EMAIL}
        >
            {children}
        </AdminShell>
    );
}
```

- [ ] **Step 2 : Modifier `AdminShell.tsx` pour accepter `devEmail` et rendre le widget**

Deux changements dans `app/admin/(protected)/_components/AdminShell.tsx` :

**2a — Import en haut du fichier** (après l'import `siteConfig`) :

```typescript
import { AdminDevWidget } from './AdminDevWidget';
```

**2b — Ajouter `devEmail` aux props de `AdminShell` et rendre le widget** :

Remplacer la signature du composant `AdminShell` :

```typescript
export function AdminShell({
    children,
    email,
    role,
    signOutAction,
    devEmail,
}: {
    children: React.ReactNode;
    email: string;
    role?: string;
    signOutAction: () => Promise<void>;
    devEmail?: string;
}) {
```

Et à la fin du JSX, avant la fermeture du `<div className="min-h-screen bg-background">`, ajouter :

```tsx
{
    devEmail && <AdminDevWidget />;
}
```

Le JSX final du composant ressemble à :

```tsx
return (
    <div className="min-h-screen bg-background">
        {/* Mobile top bar */}
        ...
        <MobileMenu ... />
        {/* Desktop layout */}
        <div className="md:flex">
            <aside ...>...</aside>
            <main className="flex-1 min-w-0">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
                    {children}
                </div>
            </main>
        </div>
        {devEmail && <AdminDevWidget />}
    </div>
);
```

- [ ] **Step 3 : Vérifier la compilation**

```bash
npx tsc --noEmit
```

Expected : 0 erreurs.

- [ ] **Step 4 : Lancer le dev server et vérifier manuellement**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/admin`. Vérifier :

- Pill "Signaler un problème" visible en bas à droite
- Clic ouvre le popover
- Sélecteur Bug/Feedback/Idée fonctionne (highlight du type actif)
- Textarea fonctionnel
- Bouton "Envoyer →" disabled pendant l'envoi
- Succès : message inline "✓ Message envoyé." + toast en haut à droite
- Widget se referme après 2s
- Si `DEVELOPPER_EMAIL` retiré de `.env.local` → widget absent

- [ ] **Step 5 : Commit final**

```bash
git add app/admin/\(protected\)/layout.tsx app/admin/\(protected\)/_components/AdminShell.tsx
git commit -m "feat: wire AdminDevWidget into admin layout"
```
