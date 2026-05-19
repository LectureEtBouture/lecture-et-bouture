import type { Horaires, JourSemaine, PlageHoraire, FermetureExceptionnelle } from '@/lib/types/parametres';

const JOURS: { key: JourSemaine; label: string }[] = [
    { key: 'lun', label: 'Lun' },
    { key: 'mar', label: 'Mar' },
    { key: 'mer', label: 'Mer' },
    { key: 'jeu', label: 'Jeu' },
    { key: 'ven', label: 'Ven' },
    { key: 'sam', label: 'Sam' },
    { key: 'dim', label: 'Dim' },
];

type Groupe = { debut: string; fin: string; plage: PlageHoraire | null };

function formaterHeure(h: string): string {
    const [heures, minutes] = h.split(':');
    return minutes === '00' ? `${parseInt(heures)}h` : `${parseInt(heures)}h${minutes}`;
}

function grouper(horaires: Horaires): Groupe[] {
    const groupes: Groupe[] = [];
    let courant: Groupe | null = null;

    for (const { key, label } of JOURS) {
        const plage = horaires[key];
        if (courant && JSON.stringify(plage) === JSON.stringify(courant.plage)) {
            courant.fin = label;
        } else {
            if (courant) groupes.push(courant);
            courant = { debut: label, fin: label, plage };
        }
    }
    if (courant) groupes.push(courant);
    return groupes;
}

function fermetureActive(fermetures: FermetureExceptionnelle[]): FermetureExceptionnelle | null {
    const today = new Date().toISOString().slice(0, 10);
    return fermetures.find((f) => today >= f.debut && today <= f.fin) ?? null;
}

export function HorairesDisplay({
    horaires,
    fermetures,
    className,
}: {
    horaires: Horaires;
    fermetures?: FermetureExceptionnelle[];
    className?: string;
}) {
    const groupes = grouper(horaires);
    const fermeture = fermetures ? fermetureActive(fermetures) : null;

    return (
        <div className={className}>
            {fermeture && (
                <p className="text-xs text-danger mb-2">
                    Fermé
                    {fermeture.message ? ` — ${fermeture.message}` : ''}
                    {fermeture.debut !== fermeture.fin
                        ? ` jusqu'au ${new Date(fermeture.fin + 'T12:00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`
                        : " aujourd'hui"}
                </p>
            )}
            <ul className="space-y-1">
                {groupes.map((groupe, i) => {
                    const label =
                        groupe.debut === groupe.fin
                            ? groupe.debut
                            : `${groupe.debut}–${groupe.fin}`;
                    const valeur = groupe.plage
                        ? `${formaterHeure(groupe.plage.open)}–${formaterHeure(groupe.plage.close)}`
                        : 'Fermé';
                    return (
                        <li key={i} className="flex gap-3 text-sm text-muted">
                            <span className="w-20 shrink-0">{label}</span>
                            <span className={groupe.plage ? 'text-foreground' : ''}>
                                {valeur}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
