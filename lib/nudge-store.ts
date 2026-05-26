import { randomUUID } from 'crypto';

export type NudgeEvent = {
    id: string;
    titres: { titre: string; slug: string }[];
    ts: number;
};

type Handler = (event: NudgeEvent) => void;

class NudgeStore {
    private handlers = new Set<Handler>();
    private buffer: NudgeEvent[] = [];
    private readonly MAX = 10;

    subscribe(fn: Handler) {
        this.handlers.add(fn);
    }

    unsubscribe(fn: Handler) {
        this.handlers.delete(fn);
    }

    emit(titres: { titre: string; slug: string }[]) {
        const event: NudgeEvent = {
            id: randomUUID(),
            titres,
            ts: Date.now(),
        };
        this.buffer = [event, ...this.buffer].slice(0, this.MAX);
        this.handlers.forEach((fn) => fn(event));
    }
}

export const nudgeStore = new NudgeStore();
