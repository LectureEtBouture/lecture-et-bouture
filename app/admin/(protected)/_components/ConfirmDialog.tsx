'use client';

import { useEffect, useRef } from 'react';

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirmer',
    onConfirm,
    onCancel,
}: {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            onCancel={onCancel}
            className="m-auto backdrop:bg-foreground/20 border border-border bg-surface p-6 max-w-sm w-full"
        >
            <p className="font-serif text-base font-bold text-foreground mb-2">
                {title}
            </p>
            <p className="text-sm text-muted mb-5">{message}</p>
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-xs text-muted hover:text-foreground transition-colors"
                >
                    Annuler
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    className="bg-primary text-background px-4 py-2 text-[11px] uppercase tracking-[0.1em] font-medium hover:bg-primary-light transition-colors"
                >
                    {confirmLabel}
                </button>
            </div>
        </dialog>
    );
}
