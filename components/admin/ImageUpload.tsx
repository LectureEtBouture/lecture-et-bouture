'use client';

import { useState, useRef } from 'react';
import { inputClass, labelClass } from './formStyles';
import { AssetPickerModal } from '@/components/ui/AssetPickerModal';

type Mode = 'fichier' | 'bibliotheque' | 'url';

interface Props {
    defaultValue?: string | null;
    defaultAltValue?: string | null;
    folder: 'boutures' | 'evenements' | 'livres' | 'blog';
    label?: string;
}

export function ImageUpload({
    defaultValue,
    defaultAltValue,
    folder,
    label = 'Image',
}: Props) {
    const [url, setUrl] = useState(defaultValue ?? '');
    const [altText, setAltText] = useState(defaultAltValue ?? '');
    const [mode, setMode] = useState<Mode>(defaultValue ? 'url' : 'fichier');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const upload = async (file: File) => {
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', folder);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                setUrl(data.url);
            } else {
                setError(data.error ?? "Erreur lors de l'upload");
            }
        } catch {
            setError('Erreur réseau');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) upload(file);
    };

    const tabBtn = (m: Mode) =>
        `px-3 py-1.5 text-[11px] uppercase tracking-[0.08em] transition-colors ${
            mode === m
                ? 'bg-primary text-background'
                : 'text-muted hover:text-foreground'
        }`;

    return (
        <div className="space-y-3">
            <p className={labelClass}>{label}</p>

            <div className="flex border border-border w-fit">
                <button
                    type="button"
                    onClick={() => setMode('fichier')}
                    className={tabBtn('fichier')}
                >
                    Fichier
                </button>
                <button
                    type="button"
                    onClick={() => setMode('bibliotheque')}
                    className={tabBtn('bibliotheque')}
                >
                    Bibliothèque
                </button>
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={tabBtn('url')}
                >
                    URL
                </button>
            </div>

            {mode === 'fichier' && (
                <div
                    onClick={() => !uploading && fileRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    className={`border border-dashed p-8 text-center cursor-pointer transition-colors ${
                        dragging
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary'
                    } ${uploading ? 'opacity-60 cursor-wait' : ''}`}
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) upload(file);
                        }}
                    />
                    <p className="text-[11px] text-muted">
                        {uploading
                            ? 'Envoi en cours…'
                            : 'Déposer une image ou cliquer pour sélectionner'}
                    </p>
                    <p className="text-[10px] text-muted/60 mt-1">
                        JPG, PNG, WebP, GIF — 10 Mo max
                    </p>
                </div>
            )}

            {mode === 'bibliotheque' && (
                <div>
                    <button
                        type="button"
                        onClick={() => setPickerOpen(true)}
                        className="border border-dashed border-border hover:border-primary p-8 w-full text-center transition-colors"
                    >
                        <p className="text-[11px] text-muted">
                            Choisir une image déjà uploadée
                        </p>
                    </button>
                    <AssetPickerModal
                        open={pickerOpen}
                        defaultFolder={folder}
                        onSelect={(selectedUrl) => {
                            setUrl(selectedUrl);
                            setPickerOpen(false);
                        }}
                        onClose={() => setPickerOpen(false)}
                    />
                </div>
            )}

            {mode === 'url' && (
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className={inputClass}
                    placeholder="https://… ou /cuttings/…"
                />
            )}

            {error && <p className="text-[11px] text-danger">{error}</p>}

            {url && (
                <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt=""
                            className="w-24 h-24 object-cover border border-border bg-background"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                setUrl('');
                                setAltText('');
                                setError(null);
                            }}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-foreground text-background text-xs flex items-center justify-center leading-none hover:bg-primary transition-colors"
                            aria-label="Supprimer l'image"
                        >
                            ×
                        </button>
                    </div>
                    <div className="flex-1 space-y-2">
                        <p className="text-[10px] text-muted break-all leading-relaxed">
                            {url}
                        </p>
                        <input
                            type="text"
                            value={altText}
                            onChange={(e) => setAltText(e.target.value)}
                            className={inputClass}
                            placeholder="Texte alternatif (accessibilité et SEO image)"
                        />
                    </div>
                </div>
            )}

            <input type="hidden" name="image" value={url} />
            <input type="hidden" name="imageAlt" value={altText} />
        </div>
    );
}
