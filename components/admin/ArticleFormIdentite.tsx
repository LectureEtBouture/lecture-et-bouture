'use client';

import { inputClass, labelClass } from './formStyles';
import { ImageUpload } from './ImageUpload';
import { slugify } from '@/lib/slugify';

export function ArticleFormIdentite({
    defaultTitre = '',
    defaultSlug = '',
    defaultAuteurNom = '',
    defaultImage = '',
    defaultImageAlt = '',
    auteurs,
}: {
    defaultTitre?: string;
    defaultSlug?: string;
    defaultAuteurNom?: string;
    defaultImage?: string | null;
    defaultImageAlt?: string | null;
    auteurs: { id: string; nom: string }[];
}) {
    return (
        <div className="space-y-4 pb-6 border-b border-border/60">
            <p className="text-xs font-medium text-foreground uppercase tracking-widest">
                Identité
            </p>
            <div>
                <label className={labelClass} htmlFor="titre">
                    Titre *
                </label>
                <input
                    id="titre"
                    name="titre"
                    type="text"
                    required
                    defaultValue={defaultTitre}
                    className={inputClass}
                    onChange={(event) => {
                        const slugInput = document.getElementById(
                            'slug',
                        ) as HTMLInputElement | null;
                        if (slugInput && !slugInput.dataset.edited) {
                            slugInput.value = slugify(event.target.value);
                        }
                    }}
                />
            </div>
            <div>
                <label className={labelClass} htmlFor="slug">
                    Slug
                </label>
                <input
                    id="slug"
                    name="slug"
                    type="text"
                    defaultValue={defaultSlug}
                    className={inputClass}
                    onInput={(event) => {
                        (event.target as HTMLInputElement).dataset.edited = '1';
                    }}
                />
            </div>
            <div>
                <label className={labelClass} htmlFor="auteurNom">
                    Auteur
                </label>
                <input
                    id="auteurNom"
                    name="auteurNom"
                    type="text"
                    defaultValue={defaultAuteurNom}
                    list="auteurs-suggestions"
                    className={inputClass}
                />
                <datalist id="auteurs-suggestions">
                    {auteurs.map((auteur) => (
                        <option key={auteur.id} value={auteur.nom} />
                    ))}
                </datalist>
            </div>
            <ImageUpload
                folder="blog"
                defaultValue={defaultImage}
                defaultAltValue={defaultImageAlt}
                label="Image de couverture"
            />
        </div>
    );
}
