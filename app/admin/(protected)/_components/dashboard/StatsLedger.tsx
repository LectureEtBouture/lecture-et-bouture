import Link from 'next/link';

interface StatLine {
    label: string;
    value: number;
    href: string;
}

export function StatsLedger({ lines }: { lines: StatLine[] }) {
    return (
        <div className="border-t border-b border-border divide-y divide-border">
            {lines.map((line) => (
                <Link
                    key={line.href}
                    href={line.href}
                    className="flex items-baseline justify-between py-3 px-1 hover:bg-white transition-colors group"
                >
                    <span className="text-muted text-[13px] tracking-wide group-hover:text-primary transition-colors">
                        {line.label}
                    </span>
                    <span className="font-serif text-2xl font-bold text-foreground tabular-nums group-hover:text-primary transition-colors ml-4 shrink-0">
                        {line.value}
                    </span>
                </Link>
            ))}
        </div>
    );
}
