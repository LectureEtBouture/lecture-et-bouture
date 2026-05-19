'use client';

import dynamic from 'next/dynamic';

const StoreMap = dynamic(() => import('./StoreMap').then((m) => m.StoreMap), {
    ssr: false,
});

export function MapWrapper() {
    return <StoreMap />;
}
