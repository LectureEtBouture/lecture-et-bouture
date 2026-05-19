import { draftMode } from 'next/headers';
import Link from 'next/link';

export async function PreviewBanner() {
    const { isEnabled } = await draftMode();
    if (!isEnabled) return null;

    return (
        <div className="bg-primary text-background flex items-center justify-between px-4 sm:px-8 py-2.5 text-[11px] uppercase tracking-[0.1em] shrink-0">
            <span>Mode prévisualisation</span>
            <Link
                href="/api/preview/exit"
                className="font-medium opacity-75 hover:opacity-100 transition-opacity"
            >
                Quitter
            </Link>
        </div>
    );
}
