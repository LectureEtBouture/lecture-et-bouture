export function ActionBtn({
    action,
    label,
    variant,
}: {
    action: () => Promise<void>;
    label: string;
    variant: 'primary' | 'secondary' | 'danger' | 'toggle-on' | 'toggle-off';
}) {
    const cls =
        variant === 'primary'
            ? 'text-primary hover:text-primary-light text-xs'
            : variant === 'danger'
              ? 'text-muted hover:text-red-600 text-xs'
              : variant === 'toggle-on'
                ? 'border border-primary text-primary hover:bg-primary hover:text-background text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 leading-none'
                : variant === 'toggle-off'
                  ? 'border border-border text-muted hover:border-primary hover:text-primary text-[10px] uppercase tracking-[0.08em] px-1.5 py-0.5 leading-none'
                  : 'text-muted hover:text-foreground text-xs';

    return (
        <form action={action} className="contents">
            <button type="submit" className={`transition-colors ${cls}`}>
                {label}
            </button>
        </form>
    );
}
