import type { InferSelectModel } from 'drizzle-orm';
import type { livres } from '@/db/schema';
import {
    inputClass,
    labelClass,
    fieldsetClass,
    legendClass,
} from './formStyles';

type Livre = InferSelectModel<typeof livres>;

export function LivreFormIdentite({ livre }: { livre?: Livre }) {
    return (
        <fieldset className={fieldsetClass}>
            <legend className={legendClass}>Identité</legend>

            <div>
                <label className={labelClass}>Titre *</label>
                <input
                    name="titre"
                    defaultValue={livre?.titre}
                    required
                    className={inputClass}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Auteur *</label>
                    <input
                        name="auteur"
                        defaultValue={livre?.auteur}
                        required
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Éditeur</label>
                    <input
                        name="editeur"
                        defaultValue={livre?.editeur ?? ''}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className={labelClass}>ISBN</label>
                    <input
                        name="isbn"
                        defaultValue={livre?.isbn ?? ''}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Année</label>
                    <input
                        name="anneePublication"
                        type="number"
                        min="1800"
                        max="2099"
                        defaultValue={livre?.anneePublication ?? ''}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Format</label>
                    <select
                        name="format"
                        defaultValue={livre?.format ?? ''}
                        className={inputClass}
                    >
                        <option value="">—</option>
                        <option value="relié">Relié</option>
                        <option value="broché">Broché</option>
                        <option value="poche">Poche</option>
                        <option value="grand format">Grand format</option>
                        <option value="coffret">Coffret</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Collection</label>
                    <input
                        name="collection"
                        defaultValue={livre?.collection ?? ''}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>Édition</label>
                    <input
                        name="edition"
                        defaultValue={livre?.edition ?? ''}
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={labelClass}>Série</label>
                    <input
                        name="serie"
                        defaultValue={livre?.serie ?? ''}
                        className={inputClass}
                    />
                </div>
                <div>
                    <label className={labelClass}>N° dans la série</label>
                    <input
                        name="numeroSerie"
                        type="number"
                        min="1"
                        defaultValue={livre?.numeroSerie ?? ''}
                        className={inputClass}
                    />
                </div>
            </div>
        </fieldset>
    );
}
