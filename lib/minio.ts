import { Client } from 'minio';

export const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
    port: parseInt(process.env.MINIO_PORT ?? '9100'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin123',
});

export const BUCKET = process.env.MINIO_BUCKET ?? 'leb';
export const PUBLIC_URL =
    process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9100/leb';

const PUBLIC_POLICY = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
        {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET}/*`],
        },
    ],
});

let bucketReady = false;

export async function ensureBucket() {
    if (bucketReady) return;
    const exists = await minioClient.bucketExists(BUCKET);
    if (!exists) await minioClient.makeBucket(BUCKET);
    await minioClient.setBucketPolicy(BUCKET, PUBLIC_POLICY);
    bucketReady = true;
}
