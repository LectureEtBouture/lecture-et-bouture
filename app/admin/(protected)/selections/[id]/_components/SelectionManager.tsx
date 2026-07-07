'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import {
    addSelectionLivreByUri,
    addSelectionItem,
    removeSelectionItem,
    reorderSelectionItems,
} from '@/lib/actions/selections';
import { SelectionSortableItem } from './SelectionSortableItem';
import { SelectionAddControls } from './SelectionAddControls';
import { SelectionSaveBar } from './SelectionSaveBar';
import { localItemKey, type SelectionItem, type LivreMeta, type LocalItem } from './types';
import type { LivreEnrichi } from './SelectionLivrePicker';
import type { ArticleEnrichi } from './SelectionArticlePicker';

export function SelectionManager({
    selectionId,
    initialItems,
    livresMeta,
    livresEnrichis,
    plantesList,
    articlesList,
}: {
    selectionId: string;
    initialItems: SelectionItem[];
    livresMeta: Map<string, LivreMeta>;
    livresEnrichis: LivreEnrichi[];
    plantesList: { id: string; nom: string }[];
    articlesList: ArticleEnrichi[];
}) {
    const router = useRouter();
    const [items, setItems] = useState<LocalItem[]>(
        initialItems.map((item) => ({ kind: 'existing', ...item })),
    );
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const originalIds = initialItems.map((item) => item.id);
    const dirty =
        items.some((item) => item.kind !== 'existing') ||
        items.length !== originalIds.length ||
        items.some(
            (item, i) => item.kind === 'existing' && item.id !== originalIds[i],
        );

    function hasUri(uri: string) {
        return items.some(
            (item) =>
                (item.kind === 'existing' && item.livreUri === uri) ||
                (item.kind === 'pending-livre' && item.uri === uri),
        );
    }

    function handleAddLivre(meta: {
        uri: string;
        titre: string | null;
        imageUrl: string | null;
        auteur: string | null;
    }) {
        setSaved(false);
        if (hasUri(meta.uri)) {
            setErrors([`« ${meta.titre ?? meta.uri} » est déjà dans la liste`]);
            return;
        }
        setErrors([]);
        setItems((current) => [
            ...current,
            {
                kind: 'pending-livre',
                tempId: crypto.randomUUID(),
                uri: meta.uri,
                titre: meta.titre,
                imageUrl: meta.imageUrl,
                auteur: meta.auteur,
            },
        ]);
    }

    function handleAddPlante(planteId: string, planteNom: string) {
        setSaved(false);
        setErrors([]);
        setItems((current) => [
            ...current,
            {
                kind: 'pending-plante',
                tempId: crypto.randomUUID(),
                planteId,
                planteNom,
            },
        ]);
    }

    function hasArticle(articleId: string) {
        return items.some(
            (item) =>
                (item.kind === 'existing' && item.articleId === articleId) ||
                (item.kind === 'pending-article' &&
                    item.articleId === articleId),
        );
    }

    function handleAddArticle(
        articleId: string,
        titre: string,
        imageUrl: string | null,
    ) {
        setSaved(false);
        if (hasArticle(articleId)) {
            setErrors([`« ${titre} » est déjà dans la liste`]);
            return;
        }
        setErrors([]);
        setItems((current) => [
            ...current,
            {
                kind: 'pending-article',
                tempId: crypto.randomUUID(),
                articleId,
                titre,
                imageUrl,
            },
        ]);
    }

    function handleRemove(key: string) {
        setSaved(false);
        setItems((current) => current.filter((item) => localItemKey(item) !== key));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setItems((current) => {
            const oldIndex = current.findIndex(
                (item) => localItemKey(item) === active.id,
            );
            const newIndex = current.findIndex(
                (item) => localItemKey(item) === over.id,
            );
            return arrayMove(current, oldIndex, newIndex);
        });
        setSaved(false);
    }

    async function handleSave() {
        setSaving(true);
        const saveErrors: string[] = [];

        const keptIds = new Set(
            items.filter((item) => item.kind === 'existing').map((item) => item.id),
        );
        const removedIds = originalIds.filter((id) => !keptIds.has(id));
        for (const id of removedIds) {
            await removeSelectionItem(selectionId, id);
        }

        const tempToReal = new Map<string, string>();
        for (const item of items) {
            if (item.kind === 'pending-livre') {
                const result = await addSelectionLivreByUri(selectionId, item.uri);
                if ('ok' in result) tempToReal.set(item.tempId, result.id);
                else saveErrors.push(`« ${item.titre ?? item.uri} » : déjà présent, ignoré`);
            } else if (item.kind === 'pending-plante') {
                const result = await addSelectionItem(
                    selectionId,
                    'plante',
                    item.planteId,
                );
                tempToReal.set(item.tempId, result.id);
            } else if (item.kind === 'pending-article') {
                const result = await addSelectionItem(
                    selectionId,
                    'article',
                    item.articleId,
                );
                tempToReal.set(item.tempId, result.id);
            }
        }

        const finalIds = items
            .map((item) =>
                item.kind === 'existing' ? item.id : tempToReal.get(item.tempId),
            )
            .filter((id): id is string => !!id);
        await reorderSelectionItems(selectionId, finalIds);

        setSaving(false);
        setErrors(saveErrors);
        setSaved(true);
        router.refresh();
    }

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                    <h2 className="text-[11px] uppercase tracking-[0.1em] font-medium text-muted">
                        Items ({items.length})
                    </h2>
                    {items.length > 1 && (
                        <span className="text-[11px] text-muted/60">
                            ↕ Glissez pour réordonner
                        </span>
                    )}
                </div>

                {items.length === 0 ? (
                    <p className="text-sm text-muted">
                        Aucun item dans cette sélection.
                    </p>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(localItemKey)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {items.map((item) => {
                                    const key = localItemKey(item);
                                    const uri =
                                        item.kind === 'existing'
                                            ? item.livreUri
                                            : item.kind === 'pending-livre'
                                              ? item.uri
                                              : null;
                                    return (
                                        <SelectionSortableItem
                                            key={key}
                                            item={item}
                                            onRemove={() => handleRemove(key)}
                                            livreMeta={
                                                uri ? livresMeta.get(uri) : undefined
                                            }
                                        />
                                    );
                                })}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}

                <SelectionSaveBar
                    dirty={dirty}
                    saving={saving}
                    saved={saved}
                    errors={errors}
                    onSave={handleSave}
                />
            </section>

            <SelectionAddControls
                livresEnrichis={livresEnrichis}
                plantesList={plantesList}
                articlesList={articlesList}
                onAddLivre={handleAddLivre}
                onAddPlante={handleAddPlante}
                onAddArticle={handleAddArticle}
            />
        </div>
    );
}
