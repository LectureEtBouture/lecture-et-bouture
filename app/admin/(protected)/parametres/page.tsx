import {
    getHoraires,
    getFermetures,
    getAnnonce,
    getMaintenance,
    getReseauxSociaux,
} from '@/lib/queries/parametres';
import { HorairesForm } from './_components/HorairesForm';
import { FermeturesForm } from './_components/FermeturesForm';
import { AnnonceForm } from './_components/AnnonceForm';
import { MaintenanceForm } from './_components/MaintenanceForm';
import { ReseauxForm } from './_components/ReseauxForm';
import { ParametresNav } from './_components/ParametresNav';

const sectionCls =
    'border border-border p-6 space-y-6 scroll-mt-24 md:scroll-mt-14';
const titleCls =
    'text-[11px] uppercase tracking-[0.12em] font-medium text-muted';
const headingCls = 'font-serif text-lg font-bold text-foreground';

export default async function ParametresPage() {
    const [horaires, fermetures, annonce, maintenance, reseaux] =
        await Promise.all([
            getHoraires(),
            getFermetures(),
            getAnnonce(),
            getMaintenance(),
            getReseauxSociaux(),
        ]);

    return (
        <div className="max-w-2xl space-y-6">
            <div>
                <p className={titleCls}>Back-office</p>
                <h1 className="font-serif text-2xl font-bold text-foreground mt-1">
                    Paramètres
                </h1>
            </div>

            <ParametresNav />

            <section id="horaires" className={sectionCls}>
                <h2 className={headingCls}>Horaires d&apos;ouverture</h2>
                <HorairesForm initial={horaires} />
            </section>

            <section id="fermetures" className={sectionCls}>
                <h2 className={headingCls}>Fermetures exceptionnelles</h2>
                <FermeturesForm initial={fermetures} />
            </section>

            <section id="annonce" className={sectionCls}>
                <h2 className={headingCls}>Annonce globale</h2>
                <p className="text-sm text-muted">
                    Bandeau affiché en haut du site. Dismissible par le
                    visiteur.
                </p>
                <AnnonceForm initial={annonce} />
            </section>

            <section id="maintenance" className={sectionCls}>
                <h2 className={headingCls}>Mode maintenance</h2>
                <p className="text-sm text-muted">
                    Remplace le site public par un écran d&apos;attente. Le
                    back-office reste accessible.
                </p>
                <MaintenanceForm initial={maintenance} />
            </section>

            <section id="reseaux" className={sectionCls}>
                <h2 className={headingCls}>Réseaux sociaux</h2>
                <p className="text-sm text-muted">
                    Liens affichés dans le footer.
                </p>
                <ReseauxForm initial={reseaux} />
            </section>
        </div>
    );
}
