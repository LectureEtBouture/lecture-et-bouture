import type { Metadata } from 'next';
import { Noto_Serif, Manrope } from 'next/font/google';
import Script from 'next/script';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { baseMetadata } from '@/lib/metadata';
import './globals.css';

const notoSerif = Noto_Serif({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-noto-serif',
    display: 'swap',
});

const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-manrope',
    display: 'swap',
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="fr" className={`${notoSerif.variable} ${manrope.variable}`}>
            <body className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
            </body>
            {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
                <Script
                    src={`${process.env.NEXT_PUBLIC_UMAMI_HOST ?? 'https://cloud.umami.is'}/script.js`}
                    data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                    strategy="afterInteractive"
                />
            )}
        </html>
    );
}
