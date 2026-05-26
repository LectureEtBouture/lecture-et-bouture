---
name: dev-feedback-widget
description: Widget flottant admin permettant d'envoyer bug/feedback/idée au développeur via DEVELOPPER_EMAIL
metadata:
    type: project
---

# Widget "Signaler un problème"

## Contexte

Feature admin permettant à l'utilisateur non-technique d'envoyer un message au développeur (bug, feedback, idée) directement depuis le back-office. Utilise `DEVELOPPER_EMAIL` défini dans `.env.local`. Si absent, le widget n'est pas rendu.

## Architecture

### Fichiers créés

- `app/admin/(protected)/_components/AdminDevWidget.tsx` — client component, widget complet
- `lib/actions/dev-feedback.ts` — server action, appelle `sendDevFeedbackEmail`
- `services/resend.ts` — ajouter `sendDevFeedbackEmail()`

### Fichiers modifiés

- `app/admin/(protected)/_components/AdminShell.tsx` — injecter `<AdminDevWidget />` si `DEVELOPPER_EMAIL` défini

## UI

### Trigger (pill fixe)

- Position : `fixed bottom-6 right-6 z-50`
- Label : "Signaler un problème" + icône flag/bug
- Style repos : `bg-surface border border-border text-muted text-[11px] uppercase tracking-[0.1em]`
- Style hover : `hover:border-primary hover:text-primary`
- `rounded-sm` cohérent avec le reste de l'admin

### Popover

- S'ouvre au-dessus du pill (`bottom-14 right-6`)
- Largeur ~300px, `bg-white border border-border shadow-sm`
- Header : label "Signaler un problème" + bouton fermer (×)
- Sélecteur de type : 3 pills — **Bug** / **Feedback** / **Idée** (pill actif `bg-primary text-background`, inactif `border border-border text-muted`)
- Textarea 4 lignes, même style que `/contact` : `border border-border bg-surface px-[14px] py-[10px] text-base rounded-sm focus:border-primary`
- Bouton envoyer : `bg-primary text-background text-[11px] uppercase tracking-[0.1em]` aligné à droite

### État succès

1. Formulaire remplacé par message inline : icône ✓ + "Message envoyé."
2. Toast discret (implémenté inline, pas de lib externe) pendant 3s en haut à droite
3. Widget se referme automatiquement après 2s

### Conditional render

`AdminShell` reçoit `devEmail: string | undefined` via prop. Si falsy → widget absent. La valeur est passée depuis le layout server qui lit `process.env.DEVELOPPER_EMAIL`.

## Email

Fonction `sendDevFeedbackEmail({ type, message, fromEmail, devEmail })` dans `services/resend.ts`.

- `from` : `RESEND_FROM_EMAIL`
- `to` : `DEVELOPPER_EMAIL`
- Subject : `[L&B Admin] {type} — back-office`
- Body text simple : type + message + email de l'admin connecté (contexte utile)

## Contraintes

- Pas de dépendance externe pour le toast (inline)
- Widget absent si `DEVELOPPER_EMAIL` non défini
- Cohérence visuelle stricte avec le design admin existant (tokens Tailwind uniquement, police, espacement)
- Composant < 150 lignes — extraire si besoin
