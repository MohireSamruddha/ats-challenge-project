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
    if (editor) {
      const content = editor.getHTML();
      setIsSaved(true);
      onChange?.(content);
    }
  };

  const handleDownloadPDF = async () => {
    if (!editorRef.current) return;
    
    const contentClone = editorRef.current.cloneNode(true) as HTMLElement;
    
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      * {
        font-family: Arial, sans-serif;
      }
      .ProseMirror {
        padding: 20px;
        max-width: 100%;
        box-sizing: border-box;
      }
      /* Ensure headings don't break across pages */
      h1, h2, h3 { 
        margin-bottom: 8px;
        page-break-after: avoid;
        page-break-inside: avoid;
      }
      /* Keep paragraphs together when possible */
      p { 
        margin-bottom: 8px; 
        line-height: 1.5;
        orphans: 3;
        widows: 3;
      }
      /* Prevent unwanted breaks within elements */
      img, table, figure {
        page-break-inside: avoid;
      }
      /* Add page breaks before major sections */
      .page-break-before {
        page-break-before: always;
      }
      /* Ensure lists stay together */
      ul, ol {
        page-break-inside: avoid;
      }
      li {
        page-break-inside: avoid;
      }
    `;
    contentClone.prepend(styleElement);

    const opt = {
      margin: [0.75, 0.75],
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: -window.scrollY,
      },
      jsPDF: { 
        unit: 'in',
        format: 'letter',
        orientation: 'portrait',
        hotfixes: ['px_scaling'],
        compress: true,
      }
    };

    try {
      const wrapper = document.createElement('div');
      wrapper.style.width = '8.5in';
      wrapper.style.margin = '0 auto';
      wrapper.appendChild(contentClone);

      await html2pdf()
        .set(opt)
        .from(wrapper)
        .toPdf()
        .output('save', { filename: 'resume.pdf' });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="border rounded-lg">
      <EditorToolbar editor={editor} />
      <div ref={editorRef} className="min-h-[500px] p-4">
        <EditorContent editor={editor} />
      </div>
      <div className="p-2 border-t flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={handleSave}
          className="hover:bg-gray-100"
        >
          {isSaved ? 'Saved ✓' : 'Save Changes'}
        </Button>
        {isSaved && (
          <Button 
            onClick={handleDownloadPDF}
            className="bg-primary hover:bg-primary/90"
          >
            Download PDF
          </Button>
        )}
      </div>
    </div>
  )
}