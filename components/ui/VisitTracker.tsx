'use client';

import { useEffect } from 'react';
import { addVisit, type Visit } from '@/hooks/useVisitHistory';

type Props = Omit<Visit, 'visitedAt'>;

export function VisitTracker(props: Props) {
    useEffect(() => {
        addVisit(props);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null;
}
