'use client';

import { useRef, useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/react';

function Btn({
    onClick,
    active,
    label,
    extraClass = '',
}: {
    onClick: () => void;
    active: boolean;
    label: string;
    extraClass?: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-2 py-1.5 text-xs leading-none transition-colors select-none ${
                active ? 'bg-primary text-background' : 'text-foreground hover:bg-border'
            } ${extraClass}`}
        >
            {label}
        </button>
    );
}

export function RteBubbleMenu({ editor }: { editor: Editor }) {
    const [linkOpen, setLinkOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkBlank, setLinkBlank] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const openLink = () => {
        const attrs = editor.getAttributes('link');
        setLinkUrl((attrs.href as string | undefined) ?? '');
        setLinkBlank((attrs.target as string | undefined) === '_blank');
        setLinkOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const applyLink = () => {
        const url = linkUrl.trim();
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({
                href: url,
                target: linkBlank ? '_blank' : null,
            }).run();
        } else {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        }
        setLinkOpen(false);
    };

    return (
        <BubbleMenu
            editor={editor}
            className="flex items-center bg-surface border border-border shadow-lg overflow-hidden"
        >
            {linkOpen ? (
                <div className="flex items-center gap-1.5 p-1.5">
                    <input
                        ref={inputRef}
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); applyLink(); }
                            if (e.key === 'Escape') setLinkOpen(false);
                        }}
                        className="w-48 text-xs border border-border px-2 py-1 bg-background focus:outline-none focus:border-primary"
                    />
                    <label className="flex items-center gap-1 text-[10px] text-muted cursor-pointer shrink-0">
                        <input
                            type="checkbox"
                            checked={linkBlank}
                            onChange={(e) => setLinkBlank(e.target.checked)}
                            className="accent-primary"
                        />
                        ↗
                    </label>
                    <button type="button" onClick={applyLink} className="px-2 py-1 bg-primary text-background text-xs hover:bg-primary-light transition-colors">✓</button>
                    <button type="button" onClick={() => setLinkOpen(false)} className="px-1.5 py-1 text-muted hover:text-foreground text-xs transition-colors">✕</button>
                </div>
            ) : (
                <>
                    <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} label="G" extraClass="font-bold" />
                    <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} label="I" extraClass="italic" />
                    <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} label="S̲" />
                    <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} label="S̶" />
                    <div className="w-px h-4 bg-border mx-0.5 self-center" />
                    <Btn onClick={openLink} active={editor.isActive('link')} label="🔗" />
                    <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} label="✦" />
                </>
            )}
        </BubbleMenu>
    );
}
