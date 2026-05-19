import { siteConfig } from '@/lib/metadata';

export function MaintenanceScreen({ message }: { message: string }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted mb-10">
                {siteConfig.name}
            </p>
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-bold text-foreground text-center leading-[1.05] tracking-[-0.02em] mb-6">
                Bientôt de retour
            </h1>
            <p className="text-base text-muted leading-[1.75] max-w-[52ch] text-center">
                {message}
            </p>
        </div>
    );
}
