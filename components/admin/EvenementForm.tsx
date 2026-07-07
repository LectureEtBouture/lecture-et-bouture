import Link from 'next/link';
import type { InferSelectModel } from 'drizzle-orm';
import type { evenements } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';
import { ImageUpload } from './ImageUpload';
import { utcToParisDatetimeLocal } from '@/lib/timezone';

type Evenement = InferSelectModel<typeof evenements>;

function toDatetimeLocal(date?: Date | null) {
    if (!date) return '';
    return utcToParisDatetimeLocal(new Date(date));
}

export function EvenementForm({
    action,
    evenement,
}: {
    action: (formData: FormData) => Promise<void>;
    evenement?: Evenement;
}) {
    return (
        <form action={action} className="space-y-6 max-w-2xl">
            <fieldset className={fieldsetClass}>
                <legend className={legendClass}>Événement</legend>
                <div>
                    <label className={labelClass}>Titre *</label>
                    <input
                        name="titre"
                        defaultValue={evenement?.titre}
                        required
                        className={inputClass}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Date de début *</label>
                        <input
                            name="dateDebut"
                            type="datetime-local"
                            defaultValue={toDatetimeLocal(evenement?.dateDebut)}
                            required
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Date de fin</label>
                        <input
                            name="dateFin"
                            type="datetime-local"
                            defaultValue={toDatetimeLocal(evenement?.dateFin)}
                            className={inputClass}
                        />
                    </div>
                </div>
                <div>
                    <label className={labelClass}>Lieu</label>
                    <input
                        name="lieu"
                        defaultValue={evenement?.lieu ?? ''}
                        className={inputClass}
                        placeholder="Nom de la librairie, adresse…"
                    />
                </div>
                <div>
                    <label className={labelClass}>Description</label>
                    <textarea
                        name="description"
                        defaultValue={evenement?.description ?? ''}
                        rows={5}
                        className={`${inputClass} resize-none`}
                    />
                </div>
                <ImageUpload
                    defaultValue={evenement?.image}
                    defaultAltValue={evenement?.imageAlt}
                    folder="evenements"
                />
            </fieldset>
            <div className="flex items-center gap-4 pt-2">
                <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                >
                    Enregistrer
                </button>
                <Link
                    href="/admin/evenements"
                    className="text-sm text-muted hover:text-foreground transition-colors"
                >
                    Annuler
                </Link>
            </div>
        </form>
    );
}
