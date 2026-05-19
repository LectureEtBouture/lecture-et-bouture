import type { Metadata } from 'next';
import { PageEditoriale } from '@/components/ui/PageEditoriale';

export const metadata: Metadata = {
    title: "Conditions Générales d'Utilisation",
    robots: { index: false, follow: false },
};

export default function CGUPage() {
    return (
        <PageEditoriale
            slug="cgu"
            title="Conditions Générales d'Utilisation"
        />
    );
}
