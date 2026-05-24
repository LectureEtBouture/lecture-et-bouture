'use client';

import { useEffect, useState } from 'react';

function getTime() {
    return new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

export function LiveClock() {
    const [time, setTime] = useState(getTime);

    useEffect(() => {
        let intervalId: ReturnType<typeof setInterval>;
        // Align first tick to wall-clock second boundary to avoid drift
        const timeoutId = setTimeout(() => {
            setTime(getTime());
            intervalId = setInterval(() => setTime(getTime()), 1000);
        }, 1000 - (Date.now() % 1000));

        return () => {
            clearTimeout(timeoutId);
            clearInterval(intervalId);
        };
    }, []);

    return <span className="tabular-nums">{time}</span>;
}
