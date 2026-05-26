# Nudge disponibilité (social proof) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Afficher un toast bottom-left sur tout le front quand un visiteur soumet une demande de disponibilité — titres cliquables vers la fiche livre, auto-dismiss 6s.

**Architecture:** Singleton in-memory `nudge-store` exposé côté serveur. SSE endpoint `/api/nudge-stream` pousse les events aux clients connectés. Client hook `useNudge` + composant `NudgeToast` + wrapper `NudgeListener` injecté dans le layout front.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, `EventSource` browser API, `ReadableStream` Next.js SSE pattern.

---

## File Map

| Fichier                           | Action   | Rôle                                                |
| --------------------------------- | -------- | --------------------------------------------------- |
| `lib/nudge-store.ts`              | Créer    | Singleton in-memory, ring buffer 10 events, pub/sub |
| `app/api/nudge-stream/route.ts`   | Créer    | SSE endpoint GET, ping 30s, connect/disconnect      |
| `app/api/disponibilite/route.ts`  | Modifier | Appel `nudgeStore.emit()` après succès              |
| `hooks/useNudge.ts`               | Créer    | EventSource, state visible/hidden, auto-dismiss 6s  |
| `components/ui/NudgeToast.tsx`    | Créer    | Toast UI, titres cliquables, animation, design      |
| `components/ui/NudgeListener.tsx` | Créer    | Wrapper client (hook + toast)                       |
| `app/(front)/layout.tsx`          | Modifier | Injecter `<NudgeListener />`                        |

---

## Task 1 — Nudge store (`lib/nudge-store.ts`)

**Files:**

- Create: `lib/nudge-store.ts`

- [ ] **Créer le store**

```typescript
// lib/nudge-store.ts

export type NudgeEvent = {
    id: string;
    titres: { titre: string; slug: string }[];
    ts: number;
};

type Handler = (event: NudgeEvent) => void;

class NudgeStore {
    private handlers = new Set<Handler>();
    private buffer: NudgeEvent[] = [];
    private readonly MAX = 10;

    subscribe(fn: Handler) {
        this.handlers.add(fn);
    }

    unsubscribe(fn: Handler) {
        this.handlers.delete(fn);
    }

    emit(titres: { titre: string; slug: string }[]) {
        const event: NudgeEvent = {
            id: crypto.randomUUID(),
            titres,
            ts: Date.now(),
        };
        this.buffer = [event, ...this.buffer].slice(0, this.MAX);
        this.handlers.forEach((fn) => fn(event));
    }
}

export const nudgeStore = new NudgeStore();
```

- [ ] **Commit**

```bash
git add lib/nudge-store.ts
git commit -m "feat: nudge store — in-memory ring buffer + pub/sub"
```

---

## Task 2 — SSE endpoint (`app/api/nudge-stream/route.ts`)

**Files:**

- Create: `app/api/nudge-stream/route.ts`

- [ ] **Créer le route handler SSE**

```typescript
// app/api/nudge-stream/route.ts

import { nudgeStore, type NudgeEvent } from '@/lib/nudge-store';

export const dynamic = 'force-dynamic';

export async function GET() {
    let cleanup: (() => void) | null = null;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            function send(data: string) {
                try {
                    controller.enqueue(encoder.encode(data));
                } catch {
                    // Connection closed
                }
            }

            // Initial ping to confirm connection
            send(': connected\n\n');

            // Push nudge events to client
            function onEvent(event: NudgeEvent) {
                send(`data: ${JSON.stringify({ titres: event.titres })}\n\n`);
            }

            nudgeStore.subscribe(onEvent);

            // Keep-alive ping every 30s to prevent proxy timeout
            const interval = setInterval(() => {
                send(': ping\n\n');
            }, 30_000);

            cleanup = () => {
                nudgeStore.unsubscribe(onEvent);
                clearInterval(interval);
            };
        },
        cancel() {
            cleanup?.();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
```

> `X-Accel-Buffering: no` désactive le buffering Nginx/Caddy qui casserait le streaming.

- [ ] **Commit**

```bash
git add app/api/nudge-stream/route.ts
git commit -m "feat: SSE endpoint /api/nudge-stream"
```

---

## Task 3 — Brancher `emit` dans `/api/disponibilite`

**Files:**

- Modify: `app/api/disponibilite/route.ts`

- [ ] **Ajouter l'import + l'appel emit après succès email**

Fichier actuel : après `await sendDisponibiliteEmail(...)`, ajouter l'emit.

```typescript
// En haut du fichier, ajouter :
import { nudgeStore } from '@/lib/nudge-store';
```

```typescript
// Après la ligne `await sendDisponibiliteEmail({...});` :
nudgeStore.emit(
    livresValides.map((livre) => ({
        titre: livre.titre,
        slug: livre.slug,
    })),
);
```

Le bloc final de la fonction ressemble à :

```typescript
await sendDisponibiliteEmail({
    nom: (nom as string).trim(),
    prenom: (prenom as string).trim(),
    email: (email as string).trim(),
    telephone: typeof telephone === 'string' ? telephone.trim() || null : null,
    livres: livresValides,
});

nudgeStore.emit(
    livresValides.map((livre) => ({
        titre: livre.titre,
        slug: livre.slug,
    })),
);

return NextResponse.json({ ok: true }, { status: 201 });
```

- [ ] **Commit**

```bash
git add app/api/disponibilite/route.ts
git commit -m "feat: emit nudge event on disponibilite success"
```

---

## Task 4 — Hook client (`hooks/useNudge.ts`)

**Files:**

- Create: `hooks/useNudge.ts`

- [ ] **Créer le hook**

```typescript
// hooks/useNudge.ts
'use client';

import { useEffect, useRef, useState } from 'react';

export type NudgeTitre = { titre: string; slug: string };

type NudgeState = {
    titres: NudgeTitre[];
    visible: boolean;
};

const DISPLAY_MS = 6_000;
const FADEOUT_MS = 200;

export function useNudge() {
    const [state, setState] = useState<NudgeState>({
        titres: [],
        visible: false,
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function dismiss() {
        setState((prev) => ({ ...prev, visible: false }));
        if (timerRef.current) clearTimeout(timerRef.current);
    }

    useEffect(() => {
        const es = new EventSource('/api/nudge-stream');

        es.onmessage = (e: MessageEvent<string>) => {
            try {
                const data = JSON.parse(e.data) as { titres: NudgeTitre[] };
                if (!Array.isArray(data.titres) || data.titres.length === 0)
                    return;

                setState({ titres: data.titres, visible: true });

                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => {
                    setState((prev) => ({ ...prev, visible: false }));
                }, DISPLAY_MS + FADEOUT_MS);
            } catch {
                // Malformed event — ignore
            }
        };

        return () => {
            es.close();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { titres: state.titres, visible: state.visible, dismiss };
}
```

- [ ] **Commit**

```bash
git add hooks/useNudge.ts
git commit -m "feat: useNudge hook — EventSource + auto-dismiss 6s"
```

---

## Task 5 — Composant toast (`components/ui/NudgeToast.tsx`)

**Files:**

- Create: `components/ui/NudgeToast.tsx`

- [ ] **Créer le composant**

```typescript
// components/ui/NudgeToast.tsx
'use client';

import Link from 'next/link';
import type { NudgeTitre } from '@/hooks/useNudge';

const MAX_SHOWN = 2;

export function NudgeToast({
    titres,
    visible,
    onClose,
}: {
    titres: NudgeTitre[];
    visible: boolean;
    onClose: () => void;
}) {
    if (titres.length === 0) return null;

    const shown = titres.slice(0, MAX_SHOWN);
    const overflow = titres.length - MAX_SHOWN;

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className={[
                'fixed bottom-6 left-6 z-50 bg-surface border border-border',
                'shadow-[0_2px_12px_rgba(26,26,26,0.06)]',
                'max-w-[280px] p-4 transition-[opacity,transform] motion-reduce:transition-none',
                visible
                    ? 'opacity-100 translate-y-0 duration-300 ease-out'
                    : 'opacity-0 translate-y-4 duration-200 ease-in pointer-events-none',
            ].join(' ')}
        >
            <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="absolute top-2.5 right-2.5 text-muted hover:text-foreground transition-colors"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M1 1l8 8M9 1L1 9" />
                </svg>
            </button>

            <p className="text-[11px] uppercase tracking-[0.1em] text-muted leading-snug mb-2.5 pr-4">
                En ce moment, un lecteur s&apos;intéresse à
            </p>

            <ul className="space-y-1">
                {shown.map((livre) => (
                    <li key={livre.slug}>
                        <Link
                            href={`/livres/${livre.slug}`}
                            className="font-serif italic text-sm text-primary hover:underline underline-offset-2 line-clamp-1 block"
                        >
                            {livre.titre}
                        </Link>
                    </li>
                ))}
                {overflow > 0 && (
                    <li className="text-[11px] text-muted pt-0.5">
                        et {overflow} autre{overflow > 1 ? 's' : ''}
                    </li>
                )}
            </ul>
        </div>
    );
}
```

> `motion-reduce:transition-none` désactive les transitions si `prefers-reduced-motion`. `pointer-events-none` quand invisible évite les clics accidentels.

- [ ] **Commit**

```bash
git add components/ui/NudgeToast.tsx
git commit -m "feat: NudgeToast — toast bottom-left, titres cliquables, design herbier"
```

---

## Task 6 — Wrapper listener + injection layout

**Files:**

- Create: `components/ui/NudgeListener.tsx`
- Modify: `app/(front)/layout.tsx`

- [ ] **Créer NudgeListener**

```typescript
// components/ui/NudgeListener.tsx
'use client';

import { useNudge } from '@/hooks/useNudge';
import { NudgeToast } from '@/components/ui/NudgeToast';

export function NudgeListener() {
    const { titres, visible, dismiss } = useNudge();
    return <NudgeToast titres={titres} visible={visible} onClose={dismiss} />;
}
```

- [ ] **Injecter dans le layout front**

Dans `app/(front)/layout.tsx`, ajouter l'import :

```typescript
import { NudgeListener } from '@/components/ui/NudgeListener';
```

Dans le JSX retourné, ajouter `<NudgeListener />` juste avant la fermeture du `<div>` principal :

```typescript
    return (
        <div className="min-h-screen flex flex-col">
            <PreviewBanner />
            {annonceActive && <AnnonceBar annonce={annonce} />}
            <Navbar publishedSlugs={publishedSlugs} />
            <main className="flex-1">{children}</main>
            <Footer />
            {process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID && (
                <>
                    <FormbricksWidget
                        environmentId={process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID}
                        appUrl={process.env.NEXT_PUBLIC_FORMBRICKS_HOST ?? 'https://app.formbricks.com'}
                    />
                    <FeedbackButton actionKey="test" />
                </>
            )}
            <NudgeListener />
        </div>
    );
```

- [ ] **Commit**

```bash
git add components/ui/NudgeListener.tsx app/(front)/layout.tsx
git commit -m "feat: NudgeListener injecté dans le layout front"
```

---

## Task 7 — Vérification manuelle

- [ ] `npm run dev`
- [ ] Ouvrir deux onglets sur n'importe quelle page front (ex: `/`, `/livres`)
- [ ] Dans un troisième onglet, aller sur `/ma-liste`, sélectionner 1-3 livres, soumettre le formulaire de disponibilité
- [ ] Vérifier que le toast apparaît dans les deux premiers onglets avec les titres corrects et cliquables
- [ ] Cliquer sur un titre dans le toast → vérifier la redirection `/livres/[slug]`
- [ ] Attendre 6s → vérifier auto-dismiss
- [ ] Cliquer × → vérifier dismiss manuel
- [ ] Vérifier `prefers-reduced-motion` : dans DevTools → Rendering → Emulate CSS media → activé → toast apparaît sans animation

- [ ] **Commit final si ajustements**

```bash
git add -p
git commit -m "fix: nudge — ajustements après test manuel"
```
