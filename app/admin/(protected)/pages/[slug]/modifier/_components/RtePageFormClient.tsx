'use client';

import dynamic from 'next/dynamic';

const RtePageForm = dynamic(
    () => import('@/components/admin/RtePageForm').then((m) => m.RtePageForm),
    {
        ssr: false,
        loading: () => (
            <div className="border border-border bg-surface min-h-[400px] animate-pulse" />
        ),
    },
);

export { RtePageForm };
