function formatBytes(bytes: number) {
    if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(0)} Ko`;
    if (bytes < 1_000_000_000) return `${(bytes / 1_000_000).toFixed(1)} Mo`;
    return `${(bytes / 1_000_000_000).toFixed(2)} Go`;
}

export function StorageQuotaBar({
    totalBytes,
    quotaBytes,
}: {
    totalBytes: number;
    quotaBytes: number;
}) {
    const percent = Math.min(100, (totalBytes / quotaBytes) * 100);
    const warning = percent > 80;

    return (
        <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground">
                    {formatBytes(totalBytes)} / {formatBytes(quotaBytes)}
                </span>
                <span className="text-[11px] text-muted">
                    {percent.toFixed(1)}%
                </span>
            </div>
            <div className="h-2 bg-border/40 overflow-hidden">
                <div
                    className={`h-full transition-[width] ${warning ? 'bg-danger' : 'bg-primary'}`}
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
