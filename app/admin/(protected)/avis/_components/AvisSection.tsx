export function AvisSection({
    titre,
    vide,
    children,
}: {
    titre: string;
    vide: string;
    children: React.ReactNode;
}) {
    const hasChildren = Array.isArray(children)
        ? children.length > 0
        : !!children;
    return (
        <section className="space-y-3">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">
                {titre}
            </h2>
            {hasChildren ? (
                children
            ) : (
                <p className="text-sm text-muted py-2">{vide}</p>
            )}
        </section>
    );
}
