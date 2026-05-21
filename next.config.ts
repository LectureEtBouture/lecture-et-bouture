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
            {
                protocol: 'https',
                hostname: 'books.google.com',
                pathname: '/books/**',
            },
            {
                protocol: 'https',
                hostname: 'covers.openlibrary.org',
                pathname: '/b/**',
            },
        ],
    },
};

export default nextConfig;
