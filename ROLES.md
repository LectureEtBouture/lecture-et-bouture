# Rôles et droits — Lecture & Bouture

## Rôles disponibles

| Rôle          | Description                                                    |
| ------------- | -------------------------------------------------------------- |
| `super_admin` | Accès total, gestion des utilisateurs et rôles, journaux       |
| `admin`       | Gestion du contenu + utilisateurs editor/moderator/contributor |
| `editor`      | Création et édition du contenu                                 |
| `moderator`   | Modération des avis uniquement                                 |
| `contributor` | Contenu + modération des avis (editor + moderator combinés)    |

## Matrice des droits

### Contenu (livres, boutures, genres, rayons, événements, sélections, pages, paramètres)

| Action    | super_admin | admin | editor | moderator | contributor |
| --------- | ----------- | ----- | ------ | --------- | ----------- |
| Créer     | ✓           | ✓     | ✓      | —         | ✓           |
| Modifier  | ✓           | ✓     | ✓      | —         | ✓           |
| Supprimer | ✓           | ✓     | ✓      | —         | ✓           |

### Avis

| Action            | super_admin | admin | editor | moderator | contributor |
| ----------------- | ----------- | ----- | ------ | --------- | ----------- |
| Valider / masquer | ✓           | ✓     | —      | ✓         | ✓           |
| Supprimer         | ✓           | ✓     | —      | ✓         | ✓           |

### Utilisateurs

| Action                 | super_admin                    | admin                            | editor | moderator | contributor |
| ---------------------- | ------------------------------ | -------------------------------- | ------ | --------- | ----------- |
| Voir la liste          | ✓                              | ✓                                | —      | —         | —           |
| Créer un user          | ✓                              | ✓ (editor/moderator/contributor) | —      | —         | —           |
| Modifier un user       | ✓                              | ✓ (non-super_admin)              | —      | —         | —           |
| Changer le rôle        | ✓ (tous)                       | ✓ (editor/moderator/contributor) | —      | —         | —           |
| Supprimer un user      | ✓ (guard: dernier super_admin) | ✓ (non-super_admin)              | —      | —         | —           |
| Réinitialiser mdp (BO) | ✓                              | ✓ (non-super_admin)              | —      | —         | —           |

### Administration

| Action                   | super_admin | admin | editor | moderator | contributor |
| ------------------------ | ----------- | ----- | ------ | --------- | ----------- |
| Journaux (`/admin/logs`) | ✓           | —     | —      | —         | —           |
| Dashboard                | ✓           | ✓     | ✓      | ✓         | ✓           |

## Reset password

Deux flows disponibles :

1. **Self-service** : lien "Mot de passe oublié" sur `/admin/login` → saisie email → token envoyé par email (expiry 1h) → lien `/admin/reset-password?token=xxx` → saisie nouveau mot de passe.

2. **Admin-initiated** : bouton "Réinitialiser" dans `/admin/users/[id]/modifier` → token généré → email envoyé à l'utilisateur concerné. Disponible pour super_admin (tous) et admin (non-super_admins).

## Guards techniques

- **Dernier super_admin** : la suppression d'un super_admin est bloquée si c'est le seul restant.
- **Admin ne voit pas les super_admins** : la liste et les actions d'un admin filtrent les super_admins.
- **Élévation de rôle** : un admin ne peut pas assigner `admin` ou `super_admin` — validation côté serveur.
- **contributor** = editor + moderator : même accès que les deux combinés, sans accès à la gestion des users ni aux logs.
