import type { Metadata } from 'next';
import { PageEditoriale } from '@/components/ui/PageEditoriale';

export const metadata: Metadata = {
    title: 'Politique de confidentialité',
    robots: { index: false, follow: false },
};

export default function PolitiqueConfidentialitePage() {
    return (
        <PageEditoriale
            slug="politique-de-confidentialite"
            title="Politique de confidentialité"
        />
    );
}
