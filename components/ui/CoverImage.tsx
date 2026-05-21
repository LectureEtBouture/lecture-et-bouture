'use client';

import { useState } from 'react';
import Image from 'next/image';

export function CoverImage({
    src,
    alt,
    sizes,
    priority,
}: {
    src: string;
    alt: string;
    sizes?: string;
    priority?: boolean;
}) {
    const [failed, setFailed] = useState(false);
    if (failed) return null;
    return (
        <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes={sizes}
            priority={priority}
            onError={() => setFailed(true)}
        />
    );
}
