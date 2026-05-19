import type { Metadata } from 'next';
import { PageEditoriale } from '@/components/ui/PageEditoriale';

export const metadata: Metadata = {
    title: 'Politique de cookies',
    robots: { index: false, follow: false },
};

export default function CookiesPage() {
    return <PageEditoriale slug="cookies" title="Politique de cookies" />;
}
