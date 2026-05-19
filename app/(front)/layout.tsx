import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AnnonceBar } from '@/components/ui/AnnonceBar';
import { MaintenanceScreen } from '@/components/ui/MaintenanceScreen';
import { PreviewBanner } from '@/components/ui/PreviewBanner';
import { FormbricksWidget } from '@/components/ui/FormbricksWidget';
import { FeedbackButton } from '@/components/ui/FeedbackButton';
import { getAnnonce, getMaintenance } from '@/lib/queries/parametres';

export default async function FrontLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [annonce, maintenance] = await Promise.all([
        getAnnonce(),
        getMaintenance(),
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
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            {process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID && (
                <>
                    <FormbricksWidget
                        environmentId={process.env.NEXT_PUBLIC_FORMBRICKS_ENV_ID}
                        appUrl={
                            process.env.NEXT_PUBLIC_FORMBRICKS_HOST ??
                            'https://app.formbricks.com'
                        }
                    />
                    <FeedbackButton actionKey="test" />
                </>
            )}
        </div>
    );
}
