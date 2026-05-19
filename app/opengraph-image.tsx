import { ImageResponse } from 'next/og';
import { loadOgFonts } from '@/lib/og-fonts';
import { siteConfig } from '@/lib/metadata';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = siteConfig.name;

export default async function Image() {
    const fonts = await loadOgFonts();

    return new ImageResponse(
        <div
            style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: '#2d4b3e',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '80px',
                gap: '0px',
            }}
        >
            <p
                style={{
                    color: '#8a9e95',
                    fontSize: 14,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontFamily: 'Noto Serif',
                    fontWeight: 400,
                    margin: '0 0 32px 0',
                }}
            >
                Librairie botanique
            </p>
            <h1
                style={{
                    color: '#f5f4ef',
                    fontSize: 80,
                    fontWeight: 700,
                    fontFamily: 'Noto Serif',
                    textAlign: 'center',
                    lineHeight: 1.05,
                    margin: '0 0 36px 0',
                    letterSpacing: '-0.02em',
                }}
            >
                Lecture &amp; Boutures
            </h1>
            <p
                style={{
                    color: '#8a9e95',
                    fontSize: 24,
                    fontFamily: 'Noto Serif',
                    fontWeight: 400,
                    textAlign: 'center',
                    fontStyle: 'italic',
                    margin: '0',
                }}
            >
                {siteConfig.tagline}
            </p>
        </div>,
        { ...size, fonts },
    );
}
