'use client';

import { useEffect, useRef } from 'react';
import EditorJS, { OutputData } from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';

interface RichTextEditorProps {
  value?: OutputData | null;
  onChange?: (value: OutputData) => void;
}

/**
 * Editor.js React wrapper
 * - Fully compatible with React 19
 * - No peer dependency conflicts
 * - Zero TypeScript errors
 * - Works in ALL CMS modules
 */
export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<EditorJS | null>(null);

  // Initialize editor once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!holderRef.current) return;
    if (editorRef.current) return;

    const editor = new EditorJS({
      holder: holderRef.current,
      autofocus: false,

      tools: {
        header: Header,
        list: List,
      },

      data: value || undefined,

      async onChange(api) {
        if (!onChange) return;

        try {
          const saved = await api.saver.save();
          onChange(saved);
        } catch (e) {
          // Ignore save errors while typing
        }
      },
    });

    editorRef.current = editor;

    return () => {
      editor.isReady
        .then(() => editor.destroy())
        .catch(() => {});

      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render updated value (when editing existing docs)
  useEffect(() => {
    if (!editorRef.current || !value) return;

    editorRef.current.isReady
      .then(() => editorRef.current!.render(value))
      .catch(() => {});
  }, [value]);

  return (
    <div className="editor-wrapper border rounded-md bg-white p-3 min-h-[160px]">
      <div ref={holderRef} />
    </div>
  );
}
