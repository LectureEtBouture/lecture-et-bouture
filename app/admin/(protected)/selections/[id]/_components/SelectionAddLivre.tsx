'use client';

import { useState, useRef } from 'react';
import { TitreAuteurSearch } from '@/components/admin/TitreAuteurSearch';
import { addSelectionLivreByUri } from '@/lib/actions/selections';
import type { LivreMetadata } from '@/lib/services/books/types';

type Feedback =
    | { type: 'ok'; titre: string }
    | { type: 'doublon'; titre: string }
    | { type: 'erreur' }
    | null;

export function SelectionAddLivre({ selectionId }: { selectionId: string }) {
    const [feedback, setFeedback] = useState<Feedback>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    function handleImport(meta: LivreMetadata) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setFeedback(null);
        addSelectionLivreByUri(selectionId, meta.sourceId).then((result) => {
            const titre = meta.titre ?? meta.sourceId;
            if ('error' in result) {
                setFeedback(
                    result.error === 'doublon'
                        ? { type: 'doublon', titre }
                        : { type: 'erreur' },
                );
            } else {
                setFeedback({ type: 'ok', titre });
                timerRef.current = setTimeout(() => setFeedback(null), 3000);
            }
        });
    }

    return (
        <div className="space-y-2">
            <TitreAuteurSearch onImport={handleImport} />
            {feedback && (
                <p
                    className={`text-[11px] leading-snug ${
                        feedback.type === 'ok'
                            ? 'text-primary'
                            : feedback.type === 'doublon'
                              ? 'text-amber-600'
                              : 'text-red-600'
                    }`}
                >
                    {feedback.type === 'ok' &&
                        `« ${feedback.titre} » ajouté à la sélection`}
                    {feedback.type === 'doublon' &&
                        `« ${feedback.titre} » est déjà dans cette sélection`}
                    {feedback.type === 'erreur' && "Erreur lors de l'ajout"}
                </p>
            )}
        </div>
    );
}
