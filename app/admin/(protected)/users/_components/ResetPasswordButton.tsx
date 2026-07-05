'use client';

import { useTransition } from 'react';
import { useToast } from '@/app/admin/(protected)/_components/ToastProvider';
import { initiatePasswordReset } from '@/lib/actions/users';

export function ResetPasswordButton({ userId }: { userId: string }) {
    const [isPending, startTransition] = useTransition();
    const showToast = useToast();

    function handleClick() {
        startTransition(async () => {
            const result = await initiatePasswordReset(userId);
            if (result.ok) {
                showToast('Email de réinitialisation envoyé.', 'success');
            } else {
                showToast(result.error, 'error');
            }
        });
    }

    return (
        <button
            type="button"
            disabled={isPending}
            onClick={handleClick}
            className="text-xs text-muted hover:text-primary transition-colors cursor-pointer disabled:cursor-wait disabled:opacity-50"
        >
            Réinitialiser le mot de passe
        </button>
    );
}
