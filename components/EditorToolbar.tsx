import { Editor } from '@tiptap/react'
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { Button } from './ui/button'

interface EditorToolbarProps {
  editor: Editor | null
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <div className="border-b p-2 flex gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleBold().run()}
        data-active={editor.isActive('bold')}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        data-active={editor.isActive('italic')}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        data-active={editor.isActive('underline')}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        data-active={editor.isActive({ textAlign: 'left' })}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        data-active={editor.isActive({ textAlign: 'center' })}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        data-active={editor.isActive({ textAlign: 'right' })}
      >
        <AlignRight className="h-4 w-4" />
      </Button>
    </div>
  )
} 