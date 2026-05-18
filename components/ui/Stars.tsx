export function Stars({
    note,
    size = 'md',
}: {
    note: number;
    size?: 'sm' | 'md';
}) {
    const rounded = Math.floor(note * 2) / 2;
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

    return (
        <span
            className={`${textSize} inline-flex items-center`}
            aria-label={`${note} étoiles sur 5`}
        >
            {Array.from({ length: 5 }, (_, i) => {
                const pos = i + 1;
                if (rounded >= pos) return <StarIcon key={i} fill="full" />;
                if (rounded >= pos - 0.5)
                    return <StarIcon key={i} fill="half" />;
                return <StarIcon key={i} fill="empty" />;
            })}
        </span>
    );
}

function StarIcon({ fill }: { fill: 'full' | 'half' | 'empty' }) {
    if (fill === 'full') return <span className="text-primary">★</span>;
    if (fill === 'empty') return <span className="text-border">★</span>;
    return (
        <span className="relative inline-block">
            <span className="text-border">★</span>
            <span
                className="absolute inset-0 overflow-hidden text-primary"
                style={{ width: '50%' }}
            >
                ★
            </span>
        </span>
    );
}
