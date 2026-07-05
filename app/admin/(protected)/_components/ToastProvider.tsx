'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type ToastVariant = 'success' | 'error';
type ToastItem = { id: number; message: string; variant: ToastVariant };

const ToastContext = createContext<
    ((message: string, variant: ToastVariant) => void) | null
>(null);

export function useToast() {
    const showToast = useContext(ToastContext);
    if (!showToast)
        throw new Error('useToast doit être utilisé dans un ToastProvider');
    return showToast;
}

let nextToastId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = useCallback((message: string, variant: ToastVariant) => {
        const id = nextToastId++;
        setToasts((current) => [...current, { id, message, variant }]);
        setTimeout(() => {
            setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 3000);
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        role="status"
                        aria-live="polite"
                        className={`bg-surface border px-4 py-3 text-sm shadow-[0_2px_12px_rgba(26,26,26,0.06)] ${
                            toast.variant === 'error'
                                ? 'border-danger text-danger'
                                : 'border-border text-foreground'
                        }`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
