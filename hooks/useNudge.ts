'use client';

import { useEffect, useRef, useState } from 'react';

export type NudgeTitre = { titre: string; slug: string };

type NudgeState = {
    titres: NudgeTitre[];
    visible: boolean;
};

const DISPLAY_MS = 6_000;
const FADEOUT_MS = 200;

export function useNudge() {
    const [state, setState] = useState<NudgeState>({ titres: [], visible: false });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function dismiss() {
        setState((prev) => ({ ...prev, visible: false }));
        if (timerRef.current) clearTimeout(timerRef.current);
    }

    useEffect(() => {
        const es = new EventSource('/api/nudge-stream');

        es.onmessage = (e: MessageEvent<string>) => {
            try {
                const data = JSON.parse(e.data) as { titres: NudgeTitre[] };
                if (!Array.isArray(data.titres) || data.titres.length === 0) return;

                setState({ titres: data.titres, visible: true });

                if (timerRef.current) clearTimeout(timerRef.current);
                timerRef.current = setTimeout(() => {
                    setState((prev) => ({ ...prev, visible: false }));
                }, DISPLAY_MS + FADEOUT_MS);
            } catch {
                // Malformed event — ignore
            }
        };

        return () => {
            es.close();
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return { titres: state.titres, visible: state.visible, dismiss };
}
