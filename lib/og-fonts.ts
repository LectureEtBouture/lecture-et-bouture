import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function loadOgFonts() {
    const [regular, bold] = await Promise.all([
        readFile(join(process.cwd(), 'public/fonts/NotoSerif-Regular.ttf')),
        readFile(join(process.cwd(), 'public/fonts/NotoSerif-Bold.ttf')),
    ]);
    return [
        {
            name: 'Noto Serif',
            data: regular,
            style: 'normal' as const,
            weight: 400 as const,
        },
        {
            name: 'Noto Serif',
            data: bold,
            style: 'normal' as const,
            weight: 700 as const,
        },
    ];
}
