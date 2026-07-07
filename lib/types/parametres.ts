export type JourSemaine = 'lun' | 'mar' | 'mer' | 'jeu' | 'ven' | 'sam' | 'dim';

export type PlageHoraire = {
    open: string;
    close: string;
    pause?: { debut: string; fin: string } | null;
};
export type Horaires = Record<JourSemaine, PlageHoraire | null>;

export type FermetureExceptionnelle = {
    debut: string;
    fin: string;
    message?: string;
};

export type Annonce = {
    active: boolean;
    type: 'info' | 'warning';
    message: string;
    expire_at: string | null;
};

export type Maintenance = {
    active: boolean;
    message: string;
};

export type PlatformSocial =
    | 'instagram'
    | 'facebook'
    | 'tiktok'
    | 'x'
    | 'linkedin'
    | 'youtube'
    | 'pinterest';

export type ReseauSocial = { platform: PlatformSocial; url: string };
export type ReseauxSociaux = ReseauSocial[];

export const HORAIRES_DEFAUT: Horaires = {
    lun: null,
    mar: { open: '10:00', close: '19:00' },
    mer: { open: '10:00', close: '19:00' },
    jeu: { open: '10:00', close: '19:00' },
    ven: { open: '10:00', close: '19:00' },
    sam: { open: '10:00', close: '19:00' },
    dim: null,
};

export const ANNONCE_DEFAUT: Annonce = {
    active: false,
    type: 'info',
    message: '',
    expire_at: null,
};

export const MAINTENANCE_DEFAUT: Maintenance = {
    active: false,
    message: 'Site en maintenance. Revenez bientôt.',
};
