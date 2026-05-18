'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';

interface Props {
    value: string;
    route: string;
    placeholder?: string;
}

export function SearchBar({
    value,
    route,
    placeholder = 'Rechercher…',
}: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [input, setInput] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    const displayValue = isFocused ? input : value;

    const handleChange = (val: string) => {
        setInput(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const next = new URLSearchParams(searchParams.toString());
            if (val.trim()) next.set('q', val.trim());
            else next.delete('q');
            const str = next.toString();
            router.push(`${route}${str ? `?${str}` : ''}`);
        }, 350);
    };

    const handleClear = () => {
        setInput('');
        const next = new URLSearchParams(searchParams.toString());
        next.delete('q');
        const str = next.toString();
        router.push(`${route}${str ? `?${str}` : ''}`);
    };

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden
                >
                    <circle
                        cx="6"
                        cy="6"
                        r="4.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        className="text-muted"
                    />
                    <path
                        d="M10 10l2.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        className="text-muted"
                    />
                </svg>
            </div>
            <input
                type="search"
                value={displayValue}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => {
                    setInput(value);
                    setIsFocused(true);
                }}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="w-full pl-10 pr-10 py-3 text-sm bg-surface border border-border focus:border-primary focus:outline-none transition-colors placeholder:text-muted text-foreground"
                aria-label={`Rechercher dans ${route}`}
            />
            {displayValue && (
                <button
                    onClick={handleClear}
                    aria-label="Effacer la recherche"
                    className="absolute inset-y-0 right-3 flex items-center text-muted hover:text-foreground transition-colors text-lg leading-none"
                >
                    ×
                </button>
            )}
        </div>
    );
}
