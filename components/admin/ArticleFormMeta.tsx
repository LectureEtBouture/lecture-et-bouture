'use client';

import { labelClass } from './formStyles';

export function ArticleFormMeta({
    defaultPublie = false,
    defaultEnAvant = false,
    categories,
    defaultCategorieIds = [],
    tags = [],
    defaultTagIds = [],
}: {
    defaultPublie?: boolean;
    defaultEnAvant?: boolean;
    categories: { id: string; nom: string }[];
    defaultCategorieIds?: string[];
    tags?: { id: string; nom: string }[];
    defaultTagIds?: string[];
}) {
    return (
        <div className="space-y-4 pb-6 border-b border-border/60">
            <p className="text-xs font-medium text-foreground uppercase tracking-widest">
                Publication
            </p>
            <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="publie"
                        defaultChecked={defaultPublie}
                        className="accent-primary"
                    />
                    <span className={labelClass + ' mb-0'}>Publié</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="enAvant"
                        defaultChecked={defaultEnAvant}
                        className="accent-primary"
                    />
                    <span className={labelClass + ' mb-0'}>
                        En avant (home)
                    </span>
                </label>
            </div>
            {categories.length > 0 && (
                <div>
                    <p className={labelClass}>Catégories</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                        {categories.map((categorie) => (
                            <label
                                key={categorie.id}
                                className="flex items-center gap-1.5 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    name="categorieIds"
                                    value={categorie.id}
                                    defaultChecked={defaultCategorieIds.includes(
                                        categorie.id,
                                    )}
                                    className="accent-primary"
                                />
                                <span className="text-xs text-foreground">
                                    {categorie.nom}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
            {tags.length > 0 && (
                <div>
                    <p className={labelClass}>Tags</p>
                    <div className="flex flex-wrap gap-3 mt-1">
                        {tags.map((tag) => (
                            <label
                                key={tag.id}
                                className="flex items-center gap-1.5 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    name="tagIds"
                                    value={tag.id}
                                    defaultChecked={defaultTagIds.includes(
                                        tag.id,
                                    )}
                                    className="accent-primary"
                                />
                                <span className="text-xs text-foreground">
                                    {tag.nom}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
