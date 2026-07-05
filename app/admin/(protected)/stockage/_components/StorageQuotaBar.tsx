function formatGo(bytes: number) {
    return (bytes / 1_000_000_000).toFixed(2);
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
                    {formatGo(totalBytes)} Go / {formatGo(quotaBytes)} Go
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
