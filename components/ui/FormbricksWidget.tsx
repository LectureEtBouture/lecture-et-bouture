'use client';

import { useEffect } from 'react';
import { initFormbricksSdk } from '@/lib/formbricks-sdk';

export function FormbricksWidget({
    environmentId,
    appUrl,
}: {
    environmentId: string;
    appUrl: string;
}) {
    useEffect(() => {
        initFormbricksSdk(environmentId, appUrl);
    }, [environmentId, appUrl]);

    return null;
}
