'use client';

import { useState, useEffect, useRef } from 'react';

const SECTIONS = [
    { id: 'horaires', label: 'Horaires' },
    { id: 'fermetures', label: 'Fermetures' },
    { id: 'annonce', label: 'Annonce' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'reseaux', label: 'Réseaux' },
    { id: 'qrcode', label: 'QR Code' },
];

export function ParametresNav() {
    const [activeId, setActiveId] = useState('horaires');
    const scrollingRef = useRef(false);
    const scrollingTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        const THRESHOLD = 0.25; // section active quand son top <= 25% du viewport

        const compute = () => {
            // Au bas de la page : dernière section gagne sans ambiguïté
            if (
                window.scrollY + window.innerHeight >=
                document.documentElement.scrollHeight - 4
            ) {
                return SECTIONS[SECTIONS.length - 1].id;
            }

            const limit = window.innerHeight * THRESHOLD;
            let active = SECTIONS[0].id;

            for (const { id } of SECTIONS) {
                const el = document.getElementById(id);
                if (!el) continue;
                // top <= limit → section a croisé le seuil, elle devient candidate
                if (el.getBoundingClientRect().top <= limit) {
                    active = id;
                }
            }

            return active;
        };

        const onScroll = () => {
            if (scrollingRef.current) return;
            setActiveId(compute());
        };

        // RAF : DOM layout settled, positions valides
        const raf = requestAnimationFrame(() => setActiveId(compute()));

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
        };
    }, []);

    function scrollTo(id: string) {
        setActiveId(id);
        scrollingRef.current = true;
        clearTimeout(scrollingTimeout.current);
        scrollingTimeout.current = setTimeout(() => {
            scrollingRef.current = false;
        }, 700);
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
