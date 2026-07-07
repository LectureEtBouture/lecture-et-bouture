const PARIS_TZ = 'Europe/Paris';

// Décalage (ms) entre l'heure murale Paris et l'instant UTC réel, pour une date donnée.
// Gère CET/CEST automatiquement via Intl (pas de dépendance externe).
function parisOffsetMs(date: Date): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: PARIS_TZ,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).formatToParts(date);

    const map: Record<string, string> = {};
    for (const part of parts) map[part.type] = part.value;

    const asIfUtc = Date.UTC(
        Number(map.year),
        Number(map.month) - 1,
        Number(map.day),
        Number(map.hour),
        Number(map.minute),
        Number(map.second),
    );
    return asIfUtc - date.getTime();
}

// "2026-07-07T14:00" (saisi par un admin en heure murale Paris) → instant UTC réel.
export function parisLocalToUTC(naiveLocal: string): Date {
    const guessUtc = new Date(`${naiveLocal}Z`);
    const offset = parisOffsetMs(guessUtc);
    return new Date(guessUtc.getTime() - offset);
}

// Instant UTC réel → "2026-07-07T14:00" en heure murale Paris (pour <input type="datetime-local">).
export function utcToParisDatetimeLocal(date: Date): string {
    const offset = parisOffsetMs(date);
    const wallClock = new Date(date.getTime() + offset);
    return wallClock.toISOString().slice(0, 16);
}
