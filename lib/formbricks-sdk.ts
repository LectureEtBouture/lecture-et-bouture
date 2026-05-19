let _ready: Promise<void> | null = null;
let _track: ((code: string) => Promise<void>) | null = null;

export function initFormbricksSdk(environmentId: string, appUrl: string) {
    _ready = import('@formbricks/js').then(async ({ default: formbricks }) => {
        _track = (code) => formbricks.track(code);
        await formbricks.setup({ environmentId, appUrl });
    });
}

export async function trackFormbricksEvent(code: string) {
    if (!_ready) return;
    await _ready;
    await _track?.(code);
}
