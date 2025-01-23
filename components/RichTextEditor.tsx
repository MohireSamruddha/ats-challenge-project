import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { EditorToolbar } from './EditorToolbar'

interface RichTextEditorProps {
  initialContent: string;
  onChange?: (html: string) => void;
}

export function RichTextEditor({ initialContent, onChange }: RichTextEditorProps): JSX.Element {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none preserve-formatting',
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  })

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}