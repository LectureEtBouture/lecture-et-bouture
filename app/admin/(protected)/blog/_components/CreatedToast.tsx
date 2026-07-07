'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/app/admin/(protected)/_components/ToastProvider';

export function CreatedToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const showToast = useToast();

    useEffect(() => {
        if (searchParams.get('created') !== '1') return;
        showToast('Article créé.', 'success');
        const next = new URLSearchParams(searchParams);
        next.delete('created');
        const query = next.toString();
        router.replace(query ? `/admin/blog?${query}` : '/admin/blog');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    return null;
}
