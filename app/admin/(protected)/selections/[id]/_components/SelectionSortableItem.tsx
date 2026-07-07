'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { localItemKey, type LivreMeta, type LocalItem } from './types';

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

function itemLabel(item: LocalItem, livreMeta?: LivreMeta): string {
    if (item.kind === 'pending-livre') return item.titre ?? item.uri;
    if (item.kind === 'pending-plante') return item.planteNom;
    if (item.kind === 'pending-article') return item.titre;
    if (item.type === 'livre') return livreMeta?.titre ?? item.livreUri ?? '';
    if (item.type === 'article') return item.articleTitre ?? '';
    return item.planteNom ?? '';
}

function itemImage(item: LocalItem, livreMeta?: LivreMeta): string | null {
    if (item.kind === 'pending-livre') return item.imageUrl;
    if (item.kind === 'pending-article') return item.imageUrl;
    if (item.kind === 'existing' && item.type === 'livre')
        return livreMeta?.imageUrl ?? null;
    if (item.kind === 'existing' && item.type === 'article')
        return item.articleImage;
    return null;
}

export function SelectionSortableItem({
    item,
    onRemove,
    livreMeta,
}: {
    item: LocalItem;
    onRemove: () => void;
    livreMeta?: LivreMeta;
}) {
    const key = localItemKey(item);
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: key });

    const label = itemLabel(item, livreMeta);
    const imageUrl = itemImage(item, livreMeta);
    const typeLabel =
        item.kind === 'pending-livre'
            ? 'livre'
            : item.kind === 'pending-plante'
              ? 'plante'
              : item.kind === 'pending-article'
                ? 'article'
                : item.type;
    const isPending = item.kind !== 'existing';

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

            {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={imageUrl}
                    alt=""
                    className="w-7 h-9 object-cover shrink-0"
                />
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">
                    <span className="text-[10px] uppercase tracking-[0.08em] text-muted mr-2">
                        {typeLabel}
                    </span>
                    {label}
                    {isPending && (
                        <span className="ml-2 text-[10px] uppercase tracking-widest text-amber-600">
                            En attente
                        </span>
                    )}
                </p>
                {item.kind === 'pending-livre' && item.auteur && (
                    <p className="text-[11px] text-muted truncate">
                        {item.auteur}
                    </p>
                )}
                {item.kind === 'existing' &&
                    item.type === 'livre' &&
                    livreMeta?.auteur && (
                        <p className="text-[11px] text-muted truncate">
                            {livreMeta.auteur}
                        </p>
                    )}
            </div>

            <button
                type="button"
                onClick={onRemove}
                className="text-xs text-muted hover:text-red-600 transition-colors shrink-0"
            >
                Retirer
            </button>
        </div>
    );
}
