export function ActionBtn({
    action,
    label,
    variant,
}: {
    action: () => Promise<void>;
    label: string;
    variant: 'primary' | 'secondary' | 'danger';
}) {
    const cls =
        variant === 'primary'
            ? 'text-primary hover:text-primary-light'
            : variant === 'danger'
              ? 'text-muted hover:text-red-600'
              : 'text-muted hover:text-foreground';

    return (
        <form action={action} className="contents">
            <button
                type="submit"
                className={`text-xs transition-colors ${cls}`}
            >
                {label}
            </button>
        </form>
    );
}
