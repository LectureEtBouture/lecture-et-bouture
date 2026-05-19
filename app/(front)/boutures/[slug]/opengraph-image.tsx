import { ImageResponse } from 'next/og';
import { getBoutureBySlug, getBouturesPubliques } from '@/lib/queries/boutures';
import { getBoutureCoverColor } from '@/lib/data';
import { loadOgFonts } from '@/lib/og-fonts';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateStaticParams() {
    const boutures = await getBouturesPubliques();
    return boutures.map((bouture) => ({ slug: bouture.slug }));
}

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const bouture = await getBoutureBySlug(slug);
    const fonts = await loadOgFonts();

    if (!bouture) {
        return new ImageResponse(
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#2d4b3e',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <span
                    style={{
                        color: '#f5f4ef',
                        fontFamily: 'Noto Serif',
                        fontSize: 32,
                    }}
                >
                    Lecture &amp; Boutures
                </span>
            </div>,
            { ...size, fonts },
        );
    }

    const coverColor = getBoutureCoverColor(bouture.lumiere ?? '');
    const prix = bouture.prix
        ? `${parseFloat(bouture.prix).toFixed(2).replace('.', ',')} €`
        : null;

    return new ImageResponse(
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Left strip — primary green */}
            <div
                style={{
                    width: '360px',
                    height: '100%',
                    backgroundColor: '#2d4b3e',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '44px',
                }}
            >
                <p
                    style={{
                        color: '#8a9e95',
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0',
                    }}
                >
                    Lecture &amp; Boutures
                </p>
            </div>

            {/* Right — content */}
            <div
                style={{
                    flex: 1,
                    backgroundColor: coverColor,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '64px 64px 64px 56px',
                }}
            >
                <p
                    style={{
                        color: '#2d4b3e',
                        fontSize: 13,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0 0 28px 0',
                    }}
                >
                    Bouture
                </p>
                <h1
                    style={{
                        color: '#1a1a1a',
                        fontSize: bouture.nom.length > 30 ? 46 : 58,
                        fontWeight: 700,
                        fontFamily: 'Noto Serif',
                        lineHeight: 1.15,
                        margin: '0 0 20px 0',
                    }}
                >
                    {bouture.nom}
                </h1>
                <p
                    style={{
                        color: '#3d6354',
                        fontSize: 20,
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        margin: prix ? '0 0 28px 0' : '0',
                    }}
                >
                    {bouture.espece}
                </p>
                {prix && (
                    <p
                        style={{
                            color: '#1a1a1a',
                            fontSize: 26,
                            fontFamily: 'Noto Serif',
                            fontWeight: 700,
                            margin: '0',
                        }}
                    >
                        {prix}
                    </p>
                )}
            </div>
        </div>,
        { ...size, fonts },
    );
}
