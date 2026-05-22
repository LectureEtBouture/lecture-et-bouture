import Image from 'next/image';

const COVER_COLORS = [
    'oklch(0.38 0.06 160)',
    'oklch(0.44 0.05 175)',
    'oklch(0.42 0.04 145)',
    'oklch(0.40 0.07 165)',
];

const NOISE = (
    <div
        className="absolute inset-0 opacity-[0.04] mix-blend-multiply pointer-events-none"
        style={{
            backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
    />
);

export function ArticleCoverBlock({
    image,
    imageAlt,
    titre,
    index = 0,
    className = '',
}: {
    image: string | null;
    imageAlt: string | null;
    titre: string;
    index?: number;
    className?: string;
}) {
    const bg = COVER_COLORS[index % COVER_COLORS.length];

    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{ backgroundColor: bg }}
        >
            {image ? (
                <Image
                    src={image}
                    alt={imageAlt ?? titre}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            ) : (
                NOISE
            )}
        </div>
    );
}
