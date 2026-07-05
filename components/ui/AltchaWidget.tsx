'use client';

import { useEffect } from 'react';

export function AltchaWidget() {
    useEffect(() => {
        import('altcha');
    }, []);

    return (
        <altcha-widget
            challenge="/api/altcha-challenge"
            name="altcha"
            type="checkbox"
        />
    );
}
