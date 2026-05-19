'use client';

import { useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';

function Btn({
    onClick,
    active,
    label,
    title,
    extraClass = '',
}: {
    onClick: () => void;
    active: boolean;
    label: string;
    title?: string;
    extraClass?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={`px-2 py-1 text-xs rounded-sm transition-colors leading-none select-none ${
                active
                    ? 'bg-primary text-background'
                    : 'text-foreground hover:bg-background'
            } ${extraClass}`}
        >
            {label}
        </button>
    );
}

function Sep() {
    return <div className="w-px h-4 bg-border mx-0.5 self-center shrink-0" />;
}

function ColorInput({
    title,
    value,
    onChange,
    label,
}: {
    title: string;
    value: string;
    onChange: (c: string) => void;
    label: string;
}) {
    return (
        <label
            title={title}
            className="relative flex items-center justify-center w-7 h-7 cursor-pointer hover:bg-background rounded-sm transition-colors"
        >
            <span
                className="text-xs font-bold pointer-events-none select-none"
                style={{ borderBottom: `3px solid ${value}` }}
            >
                {label}
            </span>
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
        </label>
    );
}

const FONT_SIZES = [
    { label: 'Défaut', value: '' },
    { label: 'Petit – 12px', value: '12px' },
    { label: 'Moyen – 14px', value: '14px' },
    { label: 'Grand – 20px', value: '20px' },
    { label: 'Titre – 28px', value: '28px' },
];

export function RteToolbar({ editor }: { editor: Editor | null }) {
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkBlank, setLinkBlank] = useState(false);
    const linkInputRef = useRef<HTMLInputElement>(null);

    if (!editor) return null;

    const openLink = () => {
        const attrs = editor.getAttributes('link');
        setLinkUrl((attrs.href as string | undefined) ?? '');
        setLinkBlank((attrs.target as string | undefined) === '_blank');
        setLinkOpen(true);
        setTimeout(() => linkInputRef.current?.focus(), 0);
    };

    const applyLink = () => {
        const url = linkUrl.trim();
        if (url) {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({
                    href: url,
                    target: linkBlank ? '_blank' : null,
                })
                .run();
        } else {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        }
        setLinkOpen(false);
    };

    const closeLink = () => {
        setLinkOpen(false);
        editor.chain().focus().run();
    };

    const textColor =
        (editor.getAttributes('textStyle').color as string | undefined) ??
        '#1a1a1a';
    const bgColor =
        (editor.getAttributes('textStyle').backgroundColor as
            | string
            | undefined) ?? '#ffffff';
    const currentSize =
        (editor.getAttributes('textStyle').fontSize as string | undefined) ??
        '';

    return (
        <div>
            <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-background">
                {/* Historique */}
                <Btn
                    onClick={() => editor.chain().focus().undo().run()}
                    active={false}
                    label="↩"
                    title="Annuler"
                />
                <Btn
                    onClick={() => editor.chain().focus().redo().run()}
                    active={false}
                    label="↪"
                    title="Rétablir"
                />
                <Sep />

                {/* Structure */}
                <Btn
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    active={editor.isActive('paragraph')}
                    label="¶"
                    title="Paragraphe"
                />
                {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                    <Btn
                        key={level}
                        onClick={() =>
                            editor
                                .chain()
                                .focus()
                                .toggleHeading({ level })
                                .run()
                        }
                        active={editor.isActive('heading', { level })}
                        label={`H${level}`}
                        title={`Titre ${level}`}
                    />
                ))}
                <Sep />

                {/* Formatage inline */}
                <Btn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    label="G"
                    title="Gras"
                    extraClass="font-bold"
                />
                <Btn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    label="I"
                    title="Italique"
                    extraClass="italic"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().toggleUnderline().run()
                    }
                    active={editor.isActive('underline')}
                    label="S̲"
                    title="Souligné"
                />
                <Btn
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    label="S̶"
                    title="Barré"
                />
                <Btn
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive('code')}
                    label="⌥"
                    title="Code inline"
                />
                <Sep />

                {/* Couleurs */}
                <ColorInput
                    title="Couleur du texte"
                    value={textColor}
                    onChange={(c) => editor.chain().focus().setColor(c).run()}
                    label="A"
                />
                <ColorInput
                    title="Couleur de fond du texte"
                    value={bgColor}
                    onChange={(c) =>
                        editor.chain().focus().setBackgroundColor(c).run()
                    }
                    label="▌"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().toggleHighlight().run()
                    }
                    active={editor.isActive('highlight')}
                    label="✦"
                    title="Surligner"
                />
                <Sep />

                {/* Taille de police */}
                <select
                    value={currentSize}
                    onChange={(e) => {
                        if (!e.target.value) {
                            editor.chain().focus().unsetFontSize().run();
                        } else {
                            editor
                                .chain()
                                .focus()
                                .setFontSize(e.target.value)
                                .run();
                        }
                    }}
                    className="text-[11px] border border-border bg-background text-foreground px-1 rounded-sm h-6 cursor-pointer"
                >
                    {FONT_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>
                            {s.label}
                        </option>
                    ))}
                </select>
                <Sep />

                {/* Alignement */}
                <Btn
                    onClick={() =>
                        editor.chain().focus().setTextAlign('left').run()
                    }
                    active={editor.isActive({ textAlign: 'left' })}
                    label="⇤"
                    title="Gauche"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().setTextAlign('center').run()
                    }
                    active={editor.isActive({ textAlign: 'center' })}
                    label="↔"
                    title="Centré"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().setTextAlign('right').run()
                    }
                    active={editor.isActive({ textAlign: 'right' })}
                    label="⇥"
                    title="Droite"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().setTextAlign('justify').run()
                    }
                    active={editor.isActive({ textAlign: 'justify' })}
                    label="⇔"
                    title="Justifié"
                />
                <Sep />

                {/* Listes */}
                <Btn
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    active={editor.isActive('bulletList')}
                    label="•≡"
                    title="Liste à puces"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    active={editor.isActive('orderedList')}
                    label="1.≡"
                    title="Liste numérotée"
                />
                <Sep />

                {/* Blocs */}
                <Btn
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    active={editor.isActive('blockquote')}
                    label="❝"
                    title="Citation"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    active={editor.isActive('codeBlock')}
                    label="</>"
                    title="Bloc de code"
                />
                <Btn
                    onClick={() =>
                        editor.chain().focus().setHorizontalRule().run()
                    }
                    active={false}
                    label="—"
                    title="Séparateur"
                />
                <Btn
                    onClick={() => editor.chain().focus().setDetails().run()}
                    active={editor.isActive('details')}
                    label="▸"
                    title="Accordéon"
                />
                <Sep />

                {/* Insertion */}
                <Btn
                    onClick={openLink}
                    active={editor.isActive('link')}
                    label="🔗"
                    title="Lien"
                />
                <Btn
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    active={false}
                    label="↵"
                    title="Saut de ligne"
                />
            </div>

            {linkOpen && (
                <div className="flex items-center gap-2 px-2 py-1.5 border-b border-border bg-background">
                    <input
                        ref={linkInputRef}
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                applyLink();
                            }
                            if (e.key === 'Escape') closeLink();
                        }}
                        className="flex-1 text-xs border border-border px-2 py-1.5 bg-surface focus:outline-none focus:border-primary transition-colors"
                    />
                    <label className="flex items-center gap-1.5 text-[11px] text-muted cursor-pointer shrink-0">
                        <input
                            type="checkbox"
                            checked={linkBlank}
                            onChange={(e) => setLinkBlank(e.target.checked)}
                            className="accent-primary"
                        />
                        Nouvel onglet
                    </label>
                    <button
                        type="button"
                        onClick={applyLink}
                        className="px-3 py-1 bg-primary text-background text-[11px] uppercase tracking-wide hover:bg-primary-light transition-colors shrink-0"
                    >
                        Valider
                    </button>
                    <button
                        type="button"
                        onClick={closeLink}
                        className="px-2 py-1 text-muted hover:text-foreground text-xs transition-colors shrink-0"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
