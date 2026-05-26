// app/api/nudge-stream/route.ts

import { nudgeStore, type NudgeEvent } from '@/lib/nudge-store';

export const dynamic = 'force-dynamic';

export async function GET() {
    let cleanup: (() => void) | null = null;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            function send(data: string) {
                try {
                    controller.enqueue(encoder.encode(data));
                } catch {
                    // Connection closed
                }
            }

            // Initial ping to confirm connection
            send(': connected\n\n');

            // Push nudge events to client
            function onEvent(event: NudgeEvent) {
                send(`data: ${JSON.stringify({ titres: event.titres })}\n\n`);
            }

            nudgeStore.subscribe(onEvent);

            // Keep-alive ping every 30s to prevent proxy timeout
            const interval = setInterval(() => {
                send(': ping\n\n');
            }, 30_000);

            cleanup = () => {
                nudgeStore.unsubscribe(onEvent);
                clearInterval(interval);
            };
        },
        cancel() {
            cleanup?.();
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
