import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchPageEditorialeWithDraft } from '@/lib/queries/pages';
import { PageEditoriale } from '@/components/ui/PageEditoriale';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const page = await fetchPageEditorialeWithDraft(slug);
    if (!page) return {};
    return { title: page.titre };
}

export default async function PageEditorialeDynamique({ params }: Props) {
    const { slug } = await params;
    const page = await fetchPageEditorialeWithDraft(slug);
    if (!page) notFound();

    return <PageEditoriale slug={slug} title={page.titre} />;
}
