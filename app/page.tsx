import type { Metadata } from 'next';
import { siteConfig } from '@/lib/metadata';

export const metadata: Metadata = {
    title: siteConfig.name,
};

export default function HomePage() {
    return (
        <section className="max-w-6xl mx-auto px-6 py-section">
            <h1 className="font-serif text-4xl text-primary">
                {siteConfig.tagline}
            </h1>
            <p className="mt-4 text-muted">{siteConfig.description}</p>
        </section>
    );
}
