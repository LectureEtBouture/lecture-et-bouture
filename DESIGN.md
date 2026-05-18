---
name: Lecture & Boutures
description: Boutique hybride livres académiques et boutures végétales — "Cultiver l'esprit, nourrir la terre."
colors:
    primary: '#2d4b3e'
    primary-light: '#3d6354'
    background: '#f5f4ef'
    foreground: '#1a1a1a'
    muted: '#8a9e95'
    border: '#d6d3c8'
    surface: '#ffffff'
typography:
    display:
        fontFamily: 'Noto Serif, Georgia, serif'
        fontSize: 'clamp(3rem, 6vw, 5rem)'
        fontWeight: 700
        lineHeight: 1.05
        letterSpacing: '-0.02em'
    headline:
        fontFamily: 'Noto Serif, Georgia, serif'
        fontSize: 'clamp(1.75rem, 3vw, 2.5rem)'
        fontWeight: 700
        lineHeight: 1.15
        letterSpacing: '-0.01em'
    title:
        fontFamily: 'Manrope, system-ui, sans-serif'
        fontSize: '1.125rem'
        fontWeight: 600
        lineHeight: 1.4
        letterSpacing: 'normal'
    body:
        fontFamily: 'Manrope, system-ui, sans-serif'
        fontSize: '1rem'
        fontWeight: 400
        lineHeight: 1.75
        letterSpacing: 'normal'
    label:
        fontFamily: 'Manrope, system-ui, sans-serif'
        fontSize: '0.6875rem'
        fontWeight: 500
        lineHeight: 1
        letterSpacing: '0.1em'
rounded:
    none: '0'
    sm: '2px'
    md: '4px'
    lg: '8px'
spacing:
    xs: '0.5rem'
    sm: '1rem'
    md: '2rem'
    lg: '3rem'
    xl: '5rem'
components:
    button-primary:
        backgroundColor: '{colors.primary}'
        textColor: '{colors.background}'
        rounded: '{rounded.none}'
        padding: '12px 32px'
    button-primary-hover:
        backgroundColor: '{colors.primary-light}'
        textColor: '{colors.background}'
        rounded: '{rounded.none}'
        padding: '12px 32px'
    button-ghost:
        backgroundColor: 'transparent'
        textColor: '{colors.primary}'
        rounded: '{rounded.none}'
        padding: '12px 32px'
    button-ghost-hover:
        backgroundColor: 'transparent'
        textColor: '{colors.foreground}'
        rounded: '{rounded.none}'
        padding: '12px 32px'
    input-field:
        backgroundColor: '{colors.surface}'
        textColor: '{colors.foreground}'
        rounded: '{rounded.sm}'
        padding: '10px 14px'
    input-field-focus:
        backgroundColor: '{colors.surface}'
        textColor: '{colors.foreground}'
        rounded: '{rounded.sm}'
        padding: '10px 14px'
---

# Design System: Lecture & Boutures

## 1. Overview

**Creative North Star: "L'Herbier de l'Esprit"**

Chaque écran est une planche d'herbier. Les produits sont des spécimens — classés, nommés, documentés avec soin. Le fond sable (#f5f4ef) est le papier vergé. Le vert profond (#2d4b3e) est l'encre du botaniste. Les blancs entre les éléments ne sont pas des vides : ils séparent les spécimens pour que chacun existe pleinement.

L'interface ne vend pas — elle présente. L'acte commercial est ailleurs (leslibraires.fr) ; ici, c'est la curation et la confiance. La densité est prohibée. Chaque page a le droit d'être presque vide.

Ce système rejette catégoriquement : la grille e-commerce dense d'Amazon ou Fnac, le lifestyle décoratif de Pinterest, les clichés SaaS (Inter, glassmorphism, hero + 3 features + CTA vert), et la jardinerie mass-market (vert criard, photos stock, sensation d'hypermarché). Si un écran peut être décrit en disant "ça ressemble à une boutique en ligne", c'est un échec.

**Key Characteristics:**

- Fond sable dominant — la couleur primaire n'est jamais un fond de page
- Serif pour les noms propres (titres, noms d'auteur, noms de plante) ; sans-serif sobre pour tout le reste
- Espacement section : 5rem minimum entre les blocs
- Sharp edges — radius nul sur les boutons et cards produit, le minimalisme organique ne vient pas des formes mais du rythme
- Mouvement discret — transitions d'état uniquement, pas de choreographie
- WCAG AA partout — le contraste n'est jamais sacrifié à l'esthétique

## 2. Colors: La Palette de l'Herbier

La palette est construite autour d'un seul axe chromatique : du sable au vert forêt. Aucune couleur d'accent secondaire. La rareté du vert est intentionnelle.

### Primary

- **Vert Forêt Profond** (`#2d4b3e`): Couleur signature. Logo, CTA primaires, états actifs, soulignements éditoriaux. Jamais utilisé comme fond de page ou fond de section.
- **Vert Forêt Éclairé** (`#3d6354`): Variante hover du primaire uniquement. Pas d'usage indépendant.

### Neutral

- **Sable Vergé** (`#f5f4ef`): Fond de page global. La base de toute composition — le papier.
- **Encre Principale** (`#1a1a1a`): Texte courant, titres de corps. Jamais noir pur.
- **Sauge Atténuée** (`#8a9e95`): Texte secondaire, métadonnées (prix secondaire, dates, labels de catégorie). Ne jamais utiliser pour du texte long.
- **Pierre Chaude** (`#d6d3c8`): Bordures, dividers, séparateurs. Jamais en accent coloré.
- **Blanc Crème** (`#ffffff`): Fond de surface — cards, inputs, modales. Distinctif du fond de page par sa blancheur légèrement plus froide.

### Named Rules

**La Règle du Spécimen Unique.** Le vert forêt profond apparaît sur ≤15% de chaque écran. Sa présence signale quelque chose d'important. Si tout est vert, rien ne l'est.

**La Règle du Papier.** `#f5f4ef` est le fond universel. Ne jamais le remplacer par du blanc pur (`#fff`) sur les pages de contenu — le papier vergé est l'identité matérielle du site.

## 3. Typography: Le Duo Éditorial

**Display Font:** Noto Serif (Georgian, serif fallback)
**Body Font:** Manrope (system-ui fallback)

**Character:** Le serif ancre dans le temps, dans la bibliothèque, dans le jardin botanique. Le sans-serif sert l'information sans se signaler. La hiérarchie se joue exclusivement dans la taille et le poids — jamais dans la couleur, jamais dans la décoration.

### Hierarchy

- **Display** (700, clamp(3rem→5rem), line-height 1.05, letter-spacing −0.02em): Titres héros, nom de la boutique en grand format. Noto Serif uniquement.
- **Headline** (700, clamp(1.75rem→2.5rem), line-height 1.15, letter-spacing −0.01em): Titres de page, noms de produit en fiche. Noto Serif.
- **Title** (Manrope 600, 1.125rem, line-height 1.4): Sous-titres de section, noms d'auteur, noms d'espèce. Sans-serif quand l'information est structurelle.
- **Body** (Manrope 400, 1rem, line-height 1.75): Descriptions, blocs de texte. Max 68ch. Jamais comprimé.
- **Label** (Manrope 500, 0.6875rem, letter-spacing 0.1em, UPPERCASE): Navigation, catégories, badges de filtre, métadonnées comme "À partir de". Espacement de lettres généreux.

### Named Rules

**La Règle de la Prose.** Corps de texte à max 68ch. Un bloc plus large n'est plus de la lecture — c'est de la typographie décorative.

**La Règle des Familles.** Noto Serif pour les objets (livres, boutures, noms propres, titres). Manrope pour l'interface (navigation, labels, prix, boutons). Les deux ne se mélangent pas dans le même rôle.

## 4. Elevation: Le Plat par Principe

Ce système est plat. La profondeur est exprimée par la **stratification tonale** : sable → blanc crème → blanc pur, du fond vers la surface. Jamais par des ombres portées.

L'exception unique : un `box-shadow` diffus et très bas (`0 2px 12px rgba(26,26,26,0.06)`) peut apparaître sur les cards produit au survol — non pour simuler une élévation physique, mais pour signaler l'interactivité sans couleur.

### Shadow Vocabulary

- **Interaction Signal** (`box-shadow: 0 2px 12px rgba(26,26,26,0.06)`): Uniquement en `:hover` sur les cards produit. Jamais au repos. Jamais sur les boutons, inputs, ou éléments de navigation.

### Named Rules

**La Règle du Herbier Plat.** Les planches d'herbier ne projettent pas d'ombre. Les surfaces sont au repos. Le mouvement vient du contenu, pas du chrome.

## 5. Components

### Buttons

Les boutons sont **sans radius** (0px). Pas de bouton arrondi — l'éditorial se présente avec des angles droits.

- **Primaire:** Fond `#2d4b3e`, texte `#f5f4ef`, padding 12px 32px, Manrope 500, label uppercase 0.1em, transition background 200ms ease-out.
- **Primaire hover:** Fond `#3d6354`, même traitement. Pas d'élévation, pas de transform.
- **Ghost:** Transparent, texte `#2d4b3e`, bordure 1px `#2d4b3e`. Hover : texte `#1a1a1a`, bordure `#1a1a1a`. Pour les actions secondaires.
- **Focus visible:** `outline: 2px solid #2d4b3e; outline-offset: 3px`. Jamais de glow flou.

### Cards Produit

Les cards produit (livres, boutures) sont des **planches**, pas des boîtes.

- **Fond:** `#ffffff` (blanc crème, distinct du sable)
- **Radius:** 0 — sharp edges
- **Bordure au repos:** Aucune
- **Hover:** `box-shadow: 0 2px 12px rgba(26,26,26,0.06)` + transition 200ms
- **Padding interne:** 1.5rem
- **Structure:** Image en pleine largeur en haut, puis nom (Headline), auteur/espèce (Title muted), prix (Body), lien discret

**La Règle des Planches.** Cards avec border-left colorée ou badge de catégorie en coins arrondis : interdit. Le produit est le sujet, pas son contenant.

### Inputs / Champs

- **Style:** Fond `#ffffff`, bordure 1px `#d6d3c8`, radius 2px, padding 10px 14px, Manrope 400 1rem
- **Focus:** `border-color: #2d4b3e; outline: none; box-shadow: none` — le vert remplace la bordure pierre, sans glow
- **Erreur:** Bordure `#b94a48` (rouge terracotta, dans la gamme chaude du projet)
- **Disabled:** Fond `#f5f4ef`, texte `#8a9e95`, curseur not-allowed

### Navigation

- **Style:** Sticky, fond `#f5f4ef` avec bordure inférieure 1px `#d6d3c8`, hauteur 64px
- **Logo:** Noto Serif 700, text-lg, `#2d4b3e` — seul usage du vert dans la navigation
- **Liens:** Manrope, 0.875rem, `rgba(26,26,26,0.70)` au repos → `#2d4b3e` au survol, transition 150ms
- **Mobile (à venir):** Menu pleine largeur, même logique tonale

### Chips / Filtres

- **Inactif:** Fond transparent, bordure 1px `#d6d3c8`, texte `#8a9e95`, Manrope 500, label uppercase, radius 2px, padding 6px 14px
- **Actif:** Fond `#2d4b3e`, bordure `#2d4b3e`, texte `#f5f4ef`
- **Hover inactif:** Bordure `#2d4b3e`, texte `#2d4b3e`

## 6. Do's and Don'ts

### Do:

- **Do** utiliser `#f5f4ef` comme fond de page universel. C'est le papier vergé — jamais du blanc pur en fond de contenu.
- **Do** laisser du vide. Une section avec peu d'éléments et 5rem d'espacement vaut mieux qu'une section remplie.
- **Do** réserver Noto Serif aux objets nommés (titres, noms de produit, auteurs, espèces). Manrope pour l'interface.
- **Do** respecter ≤68ch pour tout corps de texte.
- **Do** utiliser `reduced-motion` pour toutes les animations : `@media (prefers-reduced-motion: reduce)`.
- **Do** tester le contraste WCAG AA à chaque couleur appliquée. `#8a9e95` sur `#f5f4ef` passe en grand titre (4.5:1 non garanti) — vérifier avant usage.

### Don't:

- **Don't** utiliser le vert forêt (`#2d4b3e`) comme fond de section ou fond de page. C'est une couleur d'encre, pas de papier.
- **Don't** créer une grille de cards identiques avec icône + titre + texte répétés à l'infini. Référence Amazon/Fnac prohibée.
- **Don't** ajouter des badges "best-seller", des promotions, des compteurs d'urgence ou des bandeaux de livraison. Contraire à "La lenteur est un luxe."
- **Don't** utiliser Inter, glassmorphism, dégradés de texte, ombres lourdes, ou hero à 3 colonnes de features avec CTA vert. Référence Startup SaaS prohibée.
- **Don't** mettre des `border-left` colorées épaisses (>1px) sur des cards ou des list items. Retravailler avec fond teinté ou icône.
- **Don't** animer des propriétés CSS layout (width, height, top, left, padding). Transitions sur opacity et transform uniquement.
- **Don't** utiliser du vert vif, des photos stock de jardinerie, ou un ton informel/pratique. Référence jardinerie mass-market prohibée.
- **Don't** mettre du texte en dégradé (`background-clip: text`). Un seul ton plein.
