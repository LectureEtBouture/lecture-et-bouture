import { NextResponse } from 'next/server';
import sharp from 'sharp';
import { auth } from '@/auth';
import { minioClient, BUCKET, PUBLIC_URL, ensureBucket } from '@/lib/minio';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_WIDTH = 1200;

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string) ?? 'uploads';

    if (!(file instanceof File)) {
        return NextResponse.json(
            { error: 'Fichier manquant' },
            { status: 400 },
        );
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
            { error: 'Format non accepté (jpg, png, webp, gif)' },
            { status: 400 },
        );
    }
    if (file.size > MAX_SIZE) {
        return NextResponse.json(
            { error: 'Fichier trop volumineux (max 10 Mo)' },
            { status: 400 },
        );
    }

    const raw = Buffer.from(await file.arrayBuffer());

    const optimized = await sharp(raw)
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();

    const objectName = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.webp`;

    await ensureBucket();
    await minioClient.putObject(
        BUCKET,
        objectName,
        optimized,
        optimized.length,
        {
            'Content-Type': 'image/webp',
            'x-amz-acl': 'public-read',
        },
    );

    return NextResponse.json({ url: `${PUBLIC_URL}/${objectName}` });
}
