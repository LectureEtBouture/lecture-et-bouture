'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { removeSelectionItem } from '@/lib/actions/selections';
import type { SelectionItem, LivreMeta } from './types';

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

export function SelectionSortableItem({
    item,
    selectionId,
    livreMeta,
}: {
    item: SelectionItem;
    selectionId: string;
    livreMeta?: LivreMeta;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const label =
        item.type === 'livre'
            ? (livreMeta?.titre ?? item.livreUri)
            : item.planteNom;

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

            {item.type === 'livre' && livreMeta?.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={livreMeta.imageUrl}
                    alt=""
                    className="w-7 h-9 object-cover shrink-0"
                />
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                    <span className="text-[10px] uppercase tracking-[0.08em] text-muted mr-2">
                        {item.type}
                    </span>
                    {label}
                </p>
                {item.type === 'livre' && livreMeta?.auteur && (
                    <p className="text-[11px] text-muted truncate">
                        {livreMeta.auteur}
                    </p>
                )}
            </div>

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
