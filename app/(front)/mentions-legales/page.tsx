import type { Metadata } from 'next';
import { PageEditoriale } from '@/components/ui/PageEditoriale';

export const metadata: Metadata = {
    title: 'Mentions légales',
    robots: { index: false, follow: false },
};

export default function MentionsLegalesPage() {
    return <PageEditoriale slug="mentions-legales" title="Mentions légales" />;
}
