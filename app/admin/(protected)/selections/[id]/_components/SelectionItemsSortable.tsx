'use client';

import { useState, useRef } from 'react';
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
import { reorderSelectionItems } from '@/lib/actions/selections';
import { SelectionSortableItem } from './SelectionSortableItem';
import type { SelectionItem, LivreMeta } from './types';

export function SelectionItemsSortable({
    selectionId,
    initial,
    livresMeta,
}: {
    selectionId: string;
    initial: SelectionItem[];
    livresMeta: Map<string, LivreMeta>;
}) {
    const [items, setItems] = useState(initial);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        setItems(arrayMove(items, oldIndex, newIndex));
        setDirty(true);
        setSaved(false);
    }

    async function handleSave() {
        setSaving(true);
        await reorderSelectionItems(
            selectionId,
            items.map((item) => item.id),
        );
        setSaving(false);
        setDirty(false);
        setSaved(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setSaved(false), 2500);
    }

    if (items.length === 0) {
        return (
            <p className="text-sm text-muted">
                Aucun item dans cette sélection.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {items.map((item) => (
                            <SelectionSortableItem
                                key={item.id}
                                item={item}
                                selectionId={selectionId}
                                livreMeta={
                                    item.livreUri
                                        ? livresMeta.get(item.livreUri)
                                        : undefined
                                }
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {(dirty || saved) && (
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                    {saved && !dirty && (
                        <span className="text-[11px] text-primary">
                            Enregistré ✓
                        </span>
                    )}
                    {dirty && (
                        <>
                            <span className="text-[11px] text-amber-600">
                                · Ordre modifié, non enregistré
                            </span>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-1.5 bg-primary text-background text-[11px] uppercase tracking-widest hover:bg-primary-light transition-colors disabled:opacity-50 shrink-0"
                            >
                                {saving ? '…' : "Enregistrer l'ordre"}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
