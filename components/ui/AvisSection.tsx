import type { Avis } from '@/lib/data';
import { Stars } from './Stars';

export function AvisSection({ avis }: { avis: Avis[] }) {
    if (avis.length === 0) return null;

    return (
        <div className="space-y-4 border-t border-border pt-10">
            <h2 className="text-xs uppercase tracking-widest text-muted">
                Avis ({avis.length})
            </h2>
            <div className="space-y-6">
                {avis.map((avisItem) => (
                    <div key={avisItem.id} className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-foreground">
                                {avisItem.auteurNom}
                            </span>
                            <Stars note={avisItem.note} size="sm" />
                        </div>
                        {avisItem.texte && (
                            <p className="text-sm text-foreground/80 leading-relaxed max-w-[60ch]">
                                {avisItem.texte}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
