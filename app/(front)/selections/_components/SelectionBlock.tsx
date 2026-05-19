import Link from 'next/link';
import type {
    SelectionPublique,
    SelectionItemPublique,
} from '@/lib/queries/selections';

function ItemRow({ item }: { item: SelectionItemPublique }) {
    const href =
        item.type === 'livre'
            ? `/livres/${item.slug}`
            : `/boutures/${item.slug}`;
    const titre = item.type === 'livre' ? item.titre : item.nom;
    const meta = item.type === 'livre' ? item.auteur : item.espece;
    const typeLabel = item.type === 'livre' ? 'Livre' : 'Bouture';

    return (
        <Link
            href={href}
            className="flex items-baseline justify-between py-3 border-b border-border group last:border-b-0 items-center"
        >
            <span className="min-w-0 pr-6 flex items-baseline gap-2.5">
                <span className="font-serif text-[15px] font-medium text-foreground group-hover:text-primary transition-colors leading-snug">
                    {titre}
                </span>
                {meta && (
                    <span className="text-[11px] text-muted shrink-0 hidden sm:inline">
                        {meta}
                    </span>
                )}
            </span>
            <span className="flex items-baseline gap-3 shrink-0">
                <span className="text-[9px] uppercase tracking-[0.12em] text-muted/60">
                    {typeLabel}
                </span>
                <span className="text-[13px] text-foreground tabular-nums">
                    {item.prix} €
                </span>
            </span>
        </Link>
    );
}

export function SelectionBlock({
    selection,
    index,
}: {
    selection: SelectionPublique;
    index: number;
}) {
    return (
        <article className="py-12 first:pt-10">
            <header className="space-y-3 mb-8">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="font-serif text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-foreground leading-[1.1] tracking-[-0.01em]">
                    {selection.titre}
                </h2>
                {selection.description && (
                    <p className="text-sm text-foreground/70 leading-relaxed max-w-[60ch]">
                        {selection.description}
                    </p>
                )}
            </header>

            {selection.items.length === 0 ? (
                <p className="text-[11px] text-muted/60 italic border-t border-border pt-4">
                    Aucun item dans cette sélection.
                </p>
            ) : (
                <div className="border-t border-border">
                    {selection.items.map((item) => (
                        <ItemRow key={item.id} item={item} />
                    ))}
                </div>
            )}
        </article>
    );
}
