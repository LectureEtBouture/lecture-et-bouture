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
import Link from 'next/link';
import {
    reorderSelections,
    deleteSelection,
    toggleSelectionActive,
} from '@/lib/actions/selections';

type SelectionRow = {
    id: number;
    titre: string;
    active: boolean;
    itemCount: number;
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

function SortableRow({
    selection,
    onToggle,
}: {
    selection: SelectionRow;
    onToggle: (id: number) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: selection.id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.4 : 1,
            }}
            className={`bg-white border border-border px-4 sm:px-5 py-3.5 flex items-center gap-4 ${isDragging ? 'shadow-md z-10 relative' : ''}`}
        >
            <button
                {...attributes}
                {...listeners}
                className="text-muted hover:text-foreground cursor-grab active:cursor-grabbing touch-none shrink-0"
                aria-label="Glisser pour réordonner"
                type="button"
            >
                <DragHandle />
            </button>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                    {selection.titre}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                    <button
                        type="button"
                        onClick={() => onToggle(selection.id)}
                        className={`text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 border transition-colors leading-none ${
                            selection.active
                                ? 'border-primary text-primary hover:bg-primary hover:text-background'
                                : 'border-border text-muted hover:border-primary hover:text-primary'
                        }`}
                        title={
                            selection.active ? 'Passer en privée' : 'Publier'
                        }
                    >
                        {selection.active ? 'Publique' : 'Privée'}
                    </button>
                    <span className="text-[11px] text-muted/50">·</span>
                    <span className="text-[11px] text-muted/60 tabular-nums">
                        {selection.itemCount} item
                        {selection.itemCount !== 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <Link
                    href={`/admin/selections/${selection.id}`}
                    className="text-xs text-muted hover:text-primary transition-colors"
                >
                    Gérer
                </Link>
                <Link
                    href={`/admin/selections/${selection.id}/modifier`}
                    className="text-xs text-muted hover:text-primary transition-colors hidden sm:inline"
                >
                    Modifier
                </Link>
                <form
                    action={deleteSelection.bind(null, selection.id)}
                    className="contents"
                >
                    <button
                        type="submit"
                        className="text-xs text-muted hover:text-red-600 transition-colors"
                    >
                        Supprimer
                    </button>
                </form>
            </div>
        </div>
    );
}

export function SelectionsSortable({ initial }: { initial: SelectionRow[] }) {
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
            reorderSelections(reordered.map((item) => item.id));
        });
    }

    function handleToggle(id: number) {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, active: !item.active } : item,
            ),
        );
        startTransition(() => {
            toggleSelectionActive(id);
        });
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
                    {items.map((selection) => (
                        <SortableRow
                            key={selection.id}
                            selection={selection}
                            onToggle={handleToggle}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}
