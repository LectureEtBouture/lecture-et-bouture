'use client';

import { useTransition } from 'react';
import { ArticleFormIdentite } from './ArticleFormIdentite';
import { ArticleFormMeta } from './ArticleFormMeta';
import { RteField } from './RteField';

export function ArticleForm({
    action,
    auteurs,
    categories,
    defaultValues,
}: {
    action: (formData: FormData) => Promise<void>;
    auteurs: { id: string; nom: string }[];
    categories: { id: string; nom: string }[];
    defaultValues?: {
        titre?: string;
        slug?: string;
        auteurNom?: string | null;
        contenu?: string | null;
        image?: string | null;
        imageAlt?: string | null;
        publie?: boolean;
        enAvant?: boolean;
        categorieIds?: string[];
    };
}) {
    const [pending, startTransition] = useTransition();

    return (
        <form
            action={(formData) => startTransition(() => action(formData))}
            className="space-y-6"
        >
            <ArticleFormIdentite
                defaultTitre={defaultValues?.titre}
                defaultSlug={defaultValues?.slug}
                defaultAuteurNom={defaultValues?.auteurNom ?? undefined}
                defaultImage={defaultValues?.image}
                defaultImageAlt={defaultValues?.imageAlt}
                auteurs={auteurs}
            />
            <div className="pb-6 border-b border-border/60">
                <p className="text-xs font-medium text-foreground uppercase tracking-widest mb-4">
                    Contenu
                </p>
                <RteField
                    name="contenu"
                    defaultValue={defaultValues?.contenu ?? ''}
                />
            </div>
            <ArticleFormMeta
                defaultPublie={defaultValues?.publie}
                defaultEnAvant={defaultValues?.enAvant}
                categories={categories}
                defaultCategorieIds={defaultValues?.categorieIds}
            />
            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="px-5 py-2.5 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors disabled:opacity-50"
                >
                    {pending ? 'Enregistrement…' : 'Enregistrer'}
                </button>
            </div>
        </form>
    );
}
