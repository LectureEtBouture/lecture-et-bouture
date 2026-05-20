import type { NextConfig } from 'next';

function getMinioRemotePattern() {
    const rawUrl = process.env.MINIO_PUBLIC_URL ?? 'http://localhost:9100/leb';
    try {
        const url = new URL(rawUrl);
        return {
            protocol: url.protocol.replace(':', '') as 'http' | 'https',
            hostname: url.hostname,
            port: url.port || undefined,
            pathname: '/**',
        };
    } catch {
        return null;
    }
}

const minioPattern = getMinioRemotePattern();

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            ...(minioPattern ? [minioPattern] : []),
        ],
    },
};

export default nextConfig;
