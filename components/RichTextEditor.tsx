import { Editor, EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { EditorToolbar } from './EditorToolbar'
import { Button } from './ui/button'
import { useState, useRef } from 'react'
import html2pdf from 'html2pdf.js'

interface RichTextEditorProps {
  initialContent: string;
  onChange?: (html: string) => void;
}

export function RichTextEditor({ initialContent, onChange }: RichTextEditorProps): JSX.Element {
  const [isSaved, setIsSaved] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  
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
      setIsSaved(false);
      onChange?.(editor.getHTML());
    },
  })

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const handleSave = () => {
    setIsSaved(true);
  };

  const handleDownloadPDF = async () => {
    if (!editorRef.current) return;
    
    const opt = {
      margin: 1,
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(editorRef.current).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="border rounded-lg">
      <EditorToolbar editor={editor} />
      <div ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
      <div className="p-2 border-t flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleSave}
        >
          Save Changes
        </Button>
        {isSaved && (
          <Button 
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
        )}
      </div>
    </div>
  )
}