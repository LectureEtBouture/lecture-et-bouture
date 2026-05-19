'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useRef } from 'react';

function ToolbarButton({
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
            className={`px-2 py-1 text-xs rounded-sm transition-colors ${
                active
                    ? 'bg-primary text-background'
                    : 'text-foreground hover:bg-background'
            } ${extraClass}`}
        >
            {label}
        </button>
    );
}

export function RteField({
    name,
    defaultValue = '',
}: {
    name: string;
    defaultValue?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: defaultValue,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            if (inputRef.current) {
                inputRef.current.value = editor.getHTML();
            }
        },
    });

    return (
        <div className="border border-border bg-surface">
            <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background">
                <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    active={editor?.isActive('bold') ?? false}
                    label="G"
                    extraClass="font-bold"
                />
                <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    active={editor?.isActive('italic') ?? false}
                    label="I"
                    extraClass="italic"
                />
                <ToolbarButton
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                    }
                    active={editor?.isActive('heading', { level: 2 }) ?? false}
                    label="H2"
                />
                <ToolbarButton
                    onClick={() =>
                        editor
                            ?.chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                    }
                    active={editor?.isActive('heading', { level: 3 }) ?? false}
                    label="H3"
                />
                <ToolbarButton
                    onClick={() =>
                        editor?.chain().focus().toggleBulletList().run()
                    }
                    active={editor?.isActive('bulletList') ?? false}
                    label="• Liste"
                />
                <ToolbarButton
                    onClick={() =>
                        editor?.chain().focus().toggleOrderedList().run()
                    }
                    active={editor?.isActive('orderedList') ?? false}
                    label="1. Liste"
                />
                <ToolbarButton
                    onClick={() =>
                        editor?.chain().focus().toggleBlockquote().run()
                    }
                    active={editor?.isActive('blockquote') ?? false}
                    label="❝"
                />
            </div>
            <input
                ref={inputRef}
                type="hidden"
                name={name}
                defaultValue={defaultValue}
            />
            <EditorContent
                editor={editor}
                className="p-4 min-h-[300px] text-sm [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[280px] [&_.ProseMirror_h2]:font-serif [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:font-serif [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_blockquote]:border-l [&_.ProseMirror_blockquote]:border-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-muted"
            />
        </div>
    );
}
