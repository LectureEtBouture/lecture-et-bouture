'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useVisitHistory } from '@/hooks/useVisitHistory';

export function VusRecemment() {
    const { visits, mounted, remove, clear } = useVisitHistory();

    const livres = visits.filter((v) => v.type === 'livre');
    if (!mounted || livres.length === 0) return null;

    return (
        <div className="space-y-4 pb-6 border-b border-border">
            <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-muted">
                    Vu récemment
                </p>
                <button
                    onClick={clear}
                    className="text-[10px] uppercase tracking-widest text-muted hover:text-foreground transition-colors duration-150"
                    aria-label="Effacer tout l'historique"
                >
                    Effacer
                </button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {livres.slice(0, 8).map((visit) => (
                    <div
                        key={`${visit.type}-${visit.slug}`}
                        className="group/item flex-none w-28 space-y-1"
                    >
                        <div className="relative">
                            <Link
                                href={`/${visit.type === 'livre' ? 'livres' : 'boutures'}/${visit.slug}`}
                            >
                                <div
                                    className="aspect-book w-full relative overflow-hidden"
                                    style={{ backgroundColor: visit.coverColor }}
                                >
                                    {visit.image && (
                                        <Image
                                            src={visit.image}
                                            alt={visit.titre}
                                            fill
                                            className="object-cover"
                                            sizes="112px"
                                        />
                                    )}
                                </div>
                            </Link>
                            <button
                                onClick={() => remove(visit.type, visit.slug)}
                                className="absolute top-1 right-1 w-5 h-5 bg-background/90 text-muted hover:text-foreground flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 text-sm leading-none"
                                aria-label={`Retirer ${visit.titre} de l'historique`}
                            >
                                ×
                            </button>
                        </div>
                        <Link
                            href={`/${visit.type === 'livre' ? 'livres' : 'boutures'}/${visit.slug}`}
                            className="block"
                        >
                            <p className="text-[11px] text-foreground hover:text-primary transition-colors duration-150 line-clamp-2 leading-snug">
                                {visit.titre}
                            </p>
                            {visit.auteur && (
                                <p className="text-[10px] text-muted line-clamp-1 mt-0.5">
                                    {visit.auteur}
                                </p>
                            )}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
