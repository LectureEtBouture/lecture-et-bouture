'use client';

import { useNudge } from '@/hooks/useNudge';
import { NudgeToast } from '@/components/ui/NudgeToast';

export function NudgeListener() {
    const { titres, visible, dismiss } = useNudge();
    return <NudgeToast titres={titres} visible={visible} onClose={dismiss} />;
}
