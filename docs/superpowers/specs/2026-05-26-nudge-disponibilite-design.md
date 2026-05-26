# Spec — Nudge disponibilité livres (social proof)

## Contexte

Quand un visiteur soumet une demande de disponibilité depuis `/ma-liste`, tous les visiteurs actuellement sur le front voient apparaître un toast discret listant les titres demandés — avec lien cliquable vers chaque fiche livre.

## Architecture

### `lib/nudge-store.ts` — singleton in-memory

Ring buffer de 10 événements max. Pas de DB — un restart efface l'historique (acceptable).

```ts
type NudgeEvent = {
    id: string;
    titres: { titre: string; slug: string }[];
    ts: number;
};
```

API :

- `emit(event)` — ajoute l'event + notifie tous les abonnés SSE
- `subscribe(fn)` / `unsubscribe(fn)` — gestion des handlers SSE

### `app/api/nudge-stream/route.ts` — SSE endpoint

- `GET` uniquement, `Content-Type: text/event-stream`
- `ReadableStream` Next.js App Router
- Ping `: keep-alive\n\n` toutes les 30s (évite timeout proxy)
- Subscribe au store à l'ouverture, unsubscribe au close
- Format event : `data: {"titres":[...]}\n\n`
- Le browser reconnecte automatiquement si la connexion tombe (comportement natif `EventSource`)

### Hook dans `app/api/disponibilite/route.ts`

Après `sendDisponibiliteEmail` (succès) : `nudgeStore.emit({ titres: livresValides.map(...) })`.

### `hooks/useNudge.ts` — client

- Ouvre `EventSource('/api/nudge-stream')` au mount, ferme au unmount
- State : `event | null` + `visible: boolean`
- À réception : `visible = true`, timer 6s → `visible = false` (fade-out 200ms avant)
- Un seul event affiché à la fois (le plus récent écrase le précédent)

### `components/ui/NudgeToast.tsx` — affichage pur

Props : `titres: { titre: string; slug: string }[]`, `visible: boolean`, `onClose: () => void`

- Position : fixed bottom-left, `z-50`, `bottom-6 left-6`
- Fond `surface` (#fff), bordure 1px `border`, **border-radius 0** (sharp edges)
- Shadow : `0 2px 12px rgba(26,26,26,0.06)` (règle herbier plat)
- Animation : `translateY(16px)→0` + opacity 0→1, 300ms ease-out à l'entrée ; fade-out 200ms à la sortie
- `prefers-reduced-motion` : transitions désactivées
- Label : Raleway 0.75rem, `muted`, _"En ce moment, un lecteur s'intéresse à"_
- Titres : max 2 affichés. `<Link href="/livres/[slug]">`, Noto Serif italique, `primary`, underline au hover
- Si > 2 livres : _"et X autre(s)"_ en `muted`
- Bouton × discret pour fermer manuellement

### `components/ui/NudgeListener.tsx` — wrapper client

Compose `useNudge` + `<NudgeToast />`. Ajouté dans `app/(front)/layout.tsx`.

## Flux complet

```
POST /api/disponibilite (succès)
  → nudgeStore.emit({ titres: [{ titre, slug }] })
    → tous les SSE handlers reçoivent l'event
      → EventSource des clients déclenche useNudge
        → NudgeToast s'affiche 6s (+ 200ms fade-out)
          → disparaît
```

## Périmètre

- Toutes les pages front (layout `app/(front)/layout.tsx`)
- Exclu : `/admin`
- Slugs disponibles dans le payload existant de `/api/disponibilite` — aucun changement API nécessaire côté client

## Contraintes design (DESIGN.md)

- `border-radius: 0` — sharp edges obligatoire
- Fond `surface`, jamais vert comme fond de surface
- Noto Serif pour les titres (objets nommés), Raleway pour le label (interface)
- Shadow uniquement en signal d'interaction, pas au repos → exception acceptée ici (toast flottant)
- Transitions sur `opacity` et `transform` uniquement — jamais sur layout props
- WCAG AA — contraste vérifié sur fond `surface`

## Hors scope

- Persistance DB des events
- Multi-instance / Redis
- Historique des nudges
- Analytics sur les clics
