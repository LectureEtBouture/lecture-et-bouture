import { ImageResponse } from 'next/og';
import { getLivreBySlug } from '@/lib/queries/livres';
import { getGenreById } from '@/lib/queries/genres';
import { getCoverColor } from '@/lib/data';
import { loadOgFonts } from '@/lib/og-fonts';
import { siteConfig } from '@/lib/metadata';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const livre = await getLivreBySlug(slug);
    const fonts = await loadOgFonts();

    if (!livre) {
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
                    {siteConfig.name}
                </span>
            </div>,
            { ...size, fonts },
        );
    }

    const primaryGenreId = livre.genreIds?.[0];
    const genre = primaryGenreId ? await getGenreById(primaryGenreId) : null;
    const coverColor = getCoverColor(primaryGenreId);

    return new ImageResponse(
        <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* Left strip — cover color */}
            <div
                style={{
                    width: '360px',
                    height: '100%',
                    backgroundColor: coverColor,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: '44px',
                }}
            >
                <p
                    style={{
                        color: '#2d4b3e',
                        fontSize: 11,
                        letterSpacing: '0.16em',
                        textTransform: 'uppercase',
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0',
                    }}
                >
                    {siteConfig.name}
                </p>
            </div>

            {/* Right — content */}
            <div
                style={{
                    flex: 1,
                    backgroundColor: '#f5f4ef',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '64px 64px 64px 56px',
                }}
            >
                {genre && (
                    <p
                        style={{
                            color: '#8a9e95',
                            fontSize: 13,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            fontFamily: 'Noto Serif',
                            fontWeight: 400,
                            margin: '0 0 28px 0',
                        }}
                    >
                        {genre.nom}
                    </p>
                )}
                <h1
                    style={{
                        color: '#1a1a1a',
                        fontSize: livre.titre.length > 40 ? 42 : 54,
                        fontWeight: 700,
                        fontFamily: 'Noto Serif',
                        lineHeight: 1.15,
                        margin: '0 0 24px 0',
                    }}
                >
                    {livre.titre}
                </h1>
                <p
                    style={{
                        color: '#8a9e95',
                        fontSize: 22,
                        fontFamily: 'Noto Serif',
                        fontWeight: 400,
                        margin: '0',
                    }}
                >
                    {livre.auteur}
                </p>
            </div>
        </div>,
        { ...size, fonts },
    );
}
