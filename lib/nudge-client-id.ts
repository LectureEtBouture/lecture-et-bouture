export const NUDGE_CLIENT_ID =
    typeof globalThis.crypto !== 'undefined'
        ? globalThis.crypto.randomUUID()
        : '';
