import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnonceBar } from '@/components/ui/AnnonceBar';
import { MaintenanceScreen } from '@/components/ui/MaintenanceScreen';
import { PreviewBanner } from '@/components/ui/PreviewBanner';
import { FormbricksWidget } from '@/components/ui/FormbricksWidget';
import { FeedbackButton } from '@/components/ui/FeedbackButton';
import { NudgeListener } from '@/components/ui/NudgeListener';
import { getAnnonce, getMaintenance } from '@/lib/queries/parametres';
import { getPublishedEditorialSlugs } from '@/lib/queries/pages';

export const dynamic = 'force-dynamic';

export default async function FrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [annonce, maintenance, publishedSlugs] = await Promise.all([
        getAnnonce(),
        getMaintenance(),
        getPublishedEditorialSlugs(),
    ]);

    if (maintenance.active) {
        return <MaintenanceScreen message={maintenance.message} />;
    }

    const annonceActive =
        annonce.active &&
        annonce.message.trim().length > 0 &&
        (!annonce.expire_at || new Date(annonce.expire_at) > new Date());

    return (
        <div className="min-h-screen flex flex-col">
            <PreviewBanner />
            {annonceActive && <AnnonceBar annonce={annonce} />}
            <Navbar publishedSlugs={publishedSlugs} />
            <main className="flex-1">{children}</main>
            <Footer />
            {process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID && (
                <>
                    <FormbricksWidget
                        environmentId={
                            process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID
                        }
                        appUrl={
                            process.env.NEXT_PUBLIC_FORMBRICKS_HOST ??
                            'https://app.formbricks.com'
                        }
                    />
                    <FeedbackButton actionKey="test" />
                </>
            )}
            <NudgeListener />
        </div>
    );
}
