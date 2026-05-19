import { DIFFICULTE_LABELS } from '@/lib/data';
import { pill, pillHighlight } from '@/components/ui/filter';

const DIFFICULTES = Object.entries(DIFFICULTE_LABELS);

export function BoutureDifficulteFilter({
    activeDifficulte,
    activeChoixLibrairie,
    push,
}: {
    activeDifficulte?: string;
    activeChoixLibrairie?: boolean;
    push: (updates: Record<string, string | undefined>) => void;
}) {
    return (
        <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted">
                Difficulté
            </span>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => push({ difficulte: undefined })}
                    className={pill(!activeDifficulte)}
                >
                    Toutes
                </button>
                {DIFFICULTES.map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => push({ difficulte: value })}
                        className={pill(activeDifficulte === value)}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="pt-1">
                <button
                    onClick={() =>
                        push({ choix: activeChoixLibrairie ? undefined : '1' })
                    }
                    className={pillHighlight(!!activeChoixLibrairie)}
                >
                    Choix de la librairie
                </button>
            </div>
        </div>
    );
}
