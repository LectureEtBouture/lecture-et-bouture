export function pill(active: boolean) {
    return [
        'px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors cursor-pointer',
        active
            ? 'bg-primary border-primary text-background'
            : 'bg-transparent border-border text-muted hover:border-primary hover:text-primary',
    ].join(' ');
}

export function pillHighlight(active: boolean) {
    return [
        'px-3 py-1 text-[10px] uppercase tracking-widest border transition-colors cursor-pointer',
        active
            ? 'bg-primary border-primary text-background'
            : 'bg-transparent border-primary text-primary hover:bg-primary hover:text-background',
    ].join(' ');
}

export function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    options: { value: string; label: string }[];
    placeholder: string;
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-muted">
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none px-3 py-2 pr-8 text-xs text-foreground bg-background border border-border hover:border-primary focus:border-primary focus:outline-none transition-colors cursor-pointer"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a9e95' stroke-width='1.2' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                }}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

export function FilterBadge({
    label,
    onRemove,
}: {
    label: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-widest bg-primary text-background">
            {label}
            <button
                onClick={onRemove}
                aria-label={`Retirer le filtre ${label}`}
                className="opacity-70 hover:opacity-100 transition-opacity leading-none"
            >
                ×
            </button>
        </span>
    );
}
