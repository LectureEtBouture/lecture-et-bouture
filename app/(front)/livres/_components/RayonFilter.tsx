import type { RayonFacette } from '@/lib/queries/livres-facets';
import { pill } from '@/components/ui/filter';

export function RayonFilter({
    rayons,
    activeRayonId,
    push,
}: {
    rayons: RayonFacette[];
    activeRayonId?: string;
    push: (updates: Record<string, string | undefined>) => void;
}) {
    return (
        <div className="space-y-1.5">
            <span className="text-[10px] uppercase tracking-widest text-muted">
                Rayon
            </span>
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => push({ rayon: undefined, genre: undefined })}
                    className={pill(!activeRayonId)}
                >
                    Tous les rayons
                </button>
                {rayons.map((rayon) => (
                    <button
                        key={rayon.id}
                        onClick={() =>
                            push({ rayon: rayon.slug, genre: undefined })
                        }
                        className={pill(activeRayonId === rayon.slug)}
                    >
                        {rayon.nom}
                    </button>
                ))}
            </div>
        </div>
    );
}
