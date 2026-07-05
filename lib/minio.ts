import { Client } from 'minio';

// MINIO_ENDPOINT peut être un host nu (docker-compose) ou une URL complète
// (ex: Railway bucket qui expose ${{bucket.ENDPOINT}} sous forme https://host)
function resolveEndpoint() {
    const raw = process.env.MINIO_ENDPOINT ?? 'localhost';
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
        const url = new URL(raw);
        return {
            endPoint: url.hostname,
            port: url.port
                ? parseInt(url.port)
                : url.protocol === 'https:'
                  ? 443
                  : 80,
            useSSL: url.protocol === 'https:',
        };
    }
    return {
        endPoint: raw,
        port: parseInt(process.env.MINIO_PORT ?? '9100'),
        useSSL: process.env.MINIO_USE_SSL === 'true',
    };
}

export const minioClient = new Client({
    ...resolveEndpoint(),
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
