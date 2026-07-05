import { Readable } from 'node:stream';
import { NextResponse } from 'next/server';
import { minioClient, BUCKET } from '@/lib/minio';

export async function GET(
    _req: Request,
    ctx: RouteContext<'/api/images/[...path]'>,
) {
    const { path } = await ctx.params;
    const objectName = path.join('/');

    try {
        const stream = await minioClient.getObject(BUCKET, objectName);
        return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
            headers: {
                'Content-Type': 'image/webp',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch {
        return NextResponse.json(
            { error: 'Image introuvable' },
            { status: 404 },
        );
    }
}
