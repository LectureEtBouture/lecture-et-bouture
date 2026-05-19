import type { Metadata } from 'next';
import { PageEditoriale } from '@/components/ui/PageEditoriale';

export const metadata: Metadata = {
    title: 'Conditions Générales de Vente',
    robots: { index: false, follow: false },
};

export default function CGVPage() {
    return <PageEditoriale slug="cgv" title="Conditions Générales de Vente" />;
}
