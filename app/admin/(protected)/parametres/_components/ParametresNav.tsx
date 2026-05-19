'use client';

import { useState, useEffect } from 'react';

const SECTIONS = [
    { id: 'horaires', label: 'Horaires' },
    { id: 'fermetures', label: 'Fermetures' },
    { id: 'annonce', label: 'Annonce' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'reseaux', label: 'Réseaux' },
];

export function ParametresNav() {
    const [activeId, setActiveId] = useState('horaires');

    useEffect(() => {
        const observers = SECTIONS.map(({ id }) => {
            const el = document.getElementById(id);
            if (!el) return null;
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveId(id);
                },
                { rootMargin: '-10% 0px -80% 0px', threshold: 0 },
            );
            observer.observe(el);
            return observer;
        });
        return () => observers.forEach((obs) => obs?.disconnect());
    }, []);

    function scrollTo(id: string) {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const pillCls = (id: string) =>
        `shrink-0 px-3 py-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors whitespace-nowrap border-b-2 ${
            activeId === id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted hover:text-foreground'
        }`;

    return (
        <nav
            aria-label="Sections des paramètres"
            className="sticky top-[49px] md:top-0 z-10 -mx-4 sm:-mx-8 bg-background border-b border-border"
        >
            {/* Mobile: scroll horizontal, fade droit */}
            <div className="relative md:hidden">
                <div className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-4 pr-14">
                    {SECTIONS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            onClick={() => scrollTo(id)}
                            className={pillCls(id)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />
            </div>

            {/* Desktop: tous visibles */}
            <div className="hidden md:flex px-4 sm:px-8">
                {SECTIONS.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => scrollTo(id)}
                        className={pillCls(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
