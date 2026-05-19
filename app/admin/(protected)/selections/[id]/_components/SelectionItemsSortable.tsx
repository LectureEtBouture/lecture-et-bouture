'use client';

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
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useTransition } from 'react';
import {
    reorderSelectionItems,
    removeSelectionItem,
} from '@/lib/actions/selections';

type Item = {
    id: number;
    type: string;
    livreTitre: string | null;
    planteNom: string | null;
};

function DragHandle() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
        >
            <path
                d="M3 4.5h10M3 8h10M3 11.5h10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

function SortableItem({
    item,
    selectionId,
}: {
    item: Item;
    selectionId: number;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });
    const label = item.type === 'livre' ? item.livreTitre : item.planteNom;

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.4 : 1,
            }}
            className={`bg-white border border-border px-4 py-3 flex items-center gap-3 ${isDragging ? 'shadow-md z-10 relative' : ''}`}
        >
            <button
                {...attributes}
                {...listeners}
                className="text-muted hover:text-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
                aria-label="Réordonner"
            >
                <DragHandle />
            </button>
            <p className="text-sm text-foreground flex-1 min-w-0 truncate">
                <span className="text-[10px] uppercase tracking-[0.08em] text-muted mr-2">
                    {item.type}
                </span>
                {label}
            </p>
            <form
                action={removeSelectionItem.bind(null, selectionId, item.id)}
                className="contents"
            >
                <button
                    type="submit"
                    className="text-xs text-muted hover:text-red-600 transition-colors shrink-0"
                >
                    Retirer
                </button>
            </form>
        </div>
    );
}

export function SelectionItemsSortable({
    selectionId,
    initial,
}: {
    selectionId: number;
    initial: Item[];
}) {
    const [items, setItems] = useState(initial);
    const [, startTransition] = useTransition();

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
        const reordered = arrayMove(items, oldIndex, newIndex);
        setItems(reordered);
        startTransition(() => {
            reorderSelectionItems(
                selectionId,
                reordered.map((item) => item.id),
            );
        });
    }

    if (items.length === 0) {
        return (
            <p className="text-sm text-muted">
                Aucun item dans cette sélection.
            </p>
        );
    }

    return (
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
                        <SortableItem
                            key={item.id}
                            item={item}
                            selectionId={selectionId}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
