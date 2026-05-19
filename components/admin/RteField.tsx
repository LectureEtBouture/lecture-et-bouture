'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { useMemo, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle, Color, BackgroundColor, FontSize } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Mention from '@tiptap/extension-mention';
import DragHandle from '@tiptap/extension-drag-handle-react';
import { RteToolbar } from './rte/RteToolbar';
import { RteBubbleMenu } from './rte/RteBubbleMenu';

export function RteField({
    name,
    defaultValue = '',
    onDirtyChange,
}: {
    name: string;
    defaultValue?: string;
    onDirtyChange?: (dirty: boolean) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const initialHtmlRef = useRef<string | null>(null);

    const extensions = useMemo(
        () => [
            StarterKit.configure({
                heading: { levels: [1, 2, 3, 4, 5, 6] },
                link: { openOnClick: false },
            }),
            Details,
            DetailsContent,
            DetailsSummary,
            Highlight.configure({ multicolor: true }),
            TextStyle,
            Color,
            BackgroundColor,
            FontSize,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Mention.configure({
                suggestion: {
                    items: () => [],
                    render: () => ({
                        onStart: () => {},
                        onUpdate: () => {},
                        onKeyDown: () => false,
                        onExit: () => {},
                    }),
                },
            }),
        ],
        [],
    );

    const editor = useEditor({
        extensions,
        content: defaultValue,
        immediatelyRender: false,
        onCreate: ({ editor }) => {
            initialHtmlRef.current = editor.getHTML();
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (inputRef.current) inputRef.current.value = html;
            if (onDirtyChange && initialHtmlRef.current !== null) {
                onDirtyChange(html !== initialHtmlRef.current);
            }
        },
    });

    return (
        <div className="border border-border bg-surface">
            <RteToolbar editor={editor} />
            <input ref={inputRef} type="hidden" name={name} defaultValue={defaultValue} />
            {editor && (
                <DragHandle editor={editor}>
                    <div className="flex items-center justify-center w-5 h-5 rounded-sm text-muted hover:text-foreground hover:bg-border transition-colors cursor-grab text-xs">
                        ⠿
                    </div>
                </DragHandle>
            )}
            {editor && <RteBubbleMenu editor={editor} />}
            <EditorContent editor={editor} className="admin-rte p-4 min-h-[300px] text-sm" />
        </div>
    );
}
