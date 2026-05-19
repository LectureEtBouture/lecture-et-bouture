export function NoteLibrairie({ note }: { note: string }) {
    return (
        <aside className="relative bg-note border border-border p-8 sm:p-10">
            {/* Guillemet décoratif */}
            <span
                className="absolute top-4 left-6 font-serif text-[5rem] leading-none text-primary/10 select-none pointer-events-none"
                aria-hidden
            >
                &laquo;
            </span>

            <div className="relative space-y-5">
                <p className="text-[10px] uppercase tracking-[0.14em] font-medium text-primary">
                    Note de la librairie
                </p>

                <p className="font-manuscript text-[1.0625rem] text-foreground leading-[1.85] max-w-[58ch]">
                    {note}
                </p>

                <p className="text-sm text-muted text-right">
                    &mdash;&nbsp;L&rsquo;équipe
                </p>
            </div>
        </aside>
    );
}
