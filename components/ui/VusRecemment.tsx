'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useVisitHistory } from '@/hooks/useVisitHistory';

export function VusRecemment() {
    const { visits, mounted } = useVisitHistory();

    if (!mounted || visits.length === 0) return null;

    return (
        <div className="space-y-4 pb-6 border-b border-border">
            <p className="text-xs uppercase tracking-widest text-muted">
                Vu récemment
            </p>
            <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {visits.slice(0, 8).map((visit) => (
                    <Link
                        key={`${visit.type}-${visit.slug}`}
                        href={`/${visit.type === 'livre' ? 'livres' : 'boutures'}/${visit.slug}`}
                        className="group flex-none w-28 space-y-1"
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
                        <p className="text-[11px] text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {visit.titre}
                        </p>
                        {visit.auteur && (
                            <p className="text-[10px] text-muted line-clamp-1">
                                {visit.auteur}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
