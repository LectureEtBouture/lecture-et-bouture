export function SelectionSaveBar({
    dirty,
    saving,
    saved,
    errors,
    onSave,
}: {
    dirty: boolean;
    saving: boolean;
    saved: boolean;
    errors: string[];
    onSave: () => void;
}) {
    if (!dirty && !saved && errors.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 pt-3 border-t border-border">
            <div className="flex items-center gap-3">
                {saved && !dirty && (
                    <span className="text-[11px] text-primary">
                        Enregistré ✓
                    </span>
                )}
                {dirty && (
                    <>
                        <span className="text-[11px] text-amber-600">
                            Modifications non enregistrées
                        </span>
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="px-4 py-1.5 bg-primary text-background text-[11px] uppercase tracking-widest hover:bg-primary-light transition-colors disabled:opacity-50 shrink-0"
                        >
                            {saving ? '…' : 'Enregistrer'}
                        </button>
                    </>
                )}
            </div>
            {errors.map((error, i) => (
                <p key={i} className="text-[11px] text-red-600">
                    {error}
                </p>
            ))}
        </div>
    );
}
