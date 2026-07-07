import Image from 'next/image';
import Link from 'next/link';
import { DIFFICULTE_LABELS, LUMIERE_LABELS, ARROSAGE_LABELS } from '@/lib/data';
import type { BouturePublique } from '@/lib/queries/boutures';

export function CoverPanel({
    bouture,
    coverColor,
}: {
    bouture: BouturePublique;
    coverColor: string;
}) {
    const rawFields: { label: string; value: string | null | undefined }[] = [
        { label: 'Prix', value: `${bouture.prix} €` },
        {
            label: 'Difficulté',
            value: bouture.difficulte
                ? (DIFFICULTE_LABELS[bouture.difficulte] ?? bouture.difficulte)
                : null,
        },
        {
            label: 'Lumière',
            value: bouture.lumiere
                ? (LUMIERE_LABELS[bouture.lumiere] ?? bouture.lumiere)
                : null,
        },
        {
            label: 'Arrosage',
            value: bouture.arrosage
                ? (ARROSAGE_LABELS[bouture.arrosage] ?? bouture.arrosage)
                : null,
        },
        { label: 'Famille', value: bouture.famille },
        { label: 'Espèce', value: bouture.espece },
    ];
    const fields = rawFields.filter(
        (field): field is { label: string; value: string } =>
            field.value != null,
    );

    return (
        <div className="space-y-6">
            <div
                className="aspect-2/3 w-full relative overflow-hidden"
                style={{ backgroundColor: coverColor }}
            >
                {bouture.image && (
                    <Image
                        src={bouture.image}
                        alt={bouture.imageAlt ?? bouture.nom}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 280px"
                        priority
                    />
                )}
                <div
                    className="absolute inset-0 opacity-[0.04] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                />
            </div>

            <div className="flex items-center gap-2.5">
                <span
                    className={`w-2 h-2 rounded-full shrink-0 ${bouture.stock > 0 ? 'bg-primary' : 'bg-border'}`}
                />
                <span className="text-[10px] uppercase tracking-widest text-muted">
                    {bouture.stock > 0
                        ? 'Disponible en magasin'
                        : 'Sur commande'}
                </span>
            </div>

            <div className="space-y-3">
                <Link
                    href="/contact"
                    className="block w-full py-3 bg-primary text-background text-xs uppercase tracking-widest text-center hover:bg-primary-light transition-colors"
                >
                    Renseignez-vous en boutique
                </Link>
                <p className="text-xs text-muted text-center">
                    Disponibilités variables — contactez-nous
                </p>
            </div>

            <dl className="space-y-2 border-t border-border pt-4">
                {fields.map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4">
                        <dt className="text-[10px] uppercase tracking-widest text-muted shrink-0">
                            {label}
                        </dt>
                        <dd className="text-xs text-foreground text-right">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
