'use client';

import { useState, useRef, useCallback } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';

const QR_DISPLAY_SIZE = 200;
const QR_EXPORT_SIZE = 512;

function isValidUrl(value: string) {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

export function QRCodeSection({ defaultUrl }: { defaultUrl: string }) {
    const [url, setUrl] = useState(defaultUrl);
    const canvasRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<HTMLDivElement>(null);

    const valid = url.trim().length > 0 && isValidUrl(url.trim());

    const downloadPng = useCallback(() => {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }, []);

    const downloadSvg = useCallback(() => {
        const svg = svgRef.current?.querySelector('svg');
        if (!svg) return;
        const serialized = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([serialized], { type: 'image/svg+xml' });
        const link = document.createElement('a');
        link.download = 'qrcode.svg';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-start">
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label
                            htmlFor="qr-url"
                            className="text-[11px] uppercase tracking-[0.1em] text-muted"
                        >
                            URL encodée
                        </label>
                        <input
                            id="qr-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary font-mono"
                            placeholder="https://…"
                        />
                        {url.trim().length > 0 && !valid && (
                            <p className="text-[11px] text-danger">
                                URL invalide — inclure le protocole (https://…)
                            </p>
                        )}
                    </div>

                    {valid && (
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={downloadPng}
                                className="px-4 py-2 bg-primary text-background text-[11px] uppercase tracking-[0.1em] hover:bg-primary-light transition-colors"
                            >
                                Télécharger PNG
                            </button>
                            <button
                                type="button"
                                onClick={downloadSvg}
                                className="px-4 py-2 border border-border text-[11px] uppercase tracking-[0.1em] text-muted hover:text-foreground hover:border-foreground transition-colors"
                            >
                                Télécharger SVG
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center gap-3">
                    {valid ? (
                        <>
                            {/* Display QR */}
                            <div className="border border-border bg-white p-3">
                                <QRCodeCanvas
                                    value={url}
                                    size={QR_DISPLAY_SIZE}
                                    bgColor="#ffffff"
                                    fgColor="#1a1a1a"
                                    level="M"
                                />
                            </div>
                            <p className="text-[10px] text-muted text-center">
                                Aperçu — export {QR_EXPORT_SIZE}×{QR_EXPORT_SIZE}px
                            </p>
                            {/* Hidden high-res canvas for PNG export */}
                            <div ref={canvasRef} className="hidden">
                                <QRCodeCanvas
                                    value={url}
                                    size={QR_EXPORT_SIZE}
                                    bgColor="#ffffff"
                                    fgColor="#1a1a1a"
                                    level="M"
                                />
                            </div>
                            {/* Hidden SVG for SVG export */}
                            <div ref={svgRef} className="hidden">
                                <QRCodeSVG
                                    value={url}
                                    size={QR_EXPORT_SIZE}
                                    bgColor="#ffffff"
                                    fgColor="#1a1a1a"
                                    level="M"
                                />
                            </div>
                        </>
                    ) : (
                        <div
                            className="border border-dashed border-border bg-surface flex items-center justify-center text-muted text-[11px] tracking-[0.08em] uppercase"
                            style={{ width: QR_DISPLAY_SIZE + 24, height: QR_DISPLAY_SIZE + 24 }}
                        >
                            Aperçu
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
