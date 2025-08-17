import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onUpdate: (content: string) => void
  placeholder?: string
  className?: string
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('bold') ? 'bg-gray-200' : ''
        )}
      >
        <Bold className="h-4 w-4" />
      </Button>
      
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('italic') ? 'bg-gray-200' : ''
        )}
      >
        <Italic className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('strike') ? 'bg-gray-200' : ''
        )}
      >
        <Underline className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('heading', { level: 1 }) ? 'bg-gray-200' : ''
        )}
      >
        <Heading1 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''
        )}
      >
        <Heading2 className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('heading', { level: 3 }) ? 'bg-gray-200' : ''
        )}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('bulletList') ? 'bg-gray-200' : ''
        )}
      >
        <List className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('orderedList') ? 'bg-gray-200' : ''
        )}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={cn(
          'h-8 px-2',
          editor.isActive('blockquote') ? 'bg-gray-200' : ''
        )}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 px-2"
      >
        <Undo className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 px-2"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function RichTextEditor({ 
  content, 
  onUpdate, 
  placeholder = "Start typing...",
  className = "" 
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  return (
    <div className={cn("border border-gray-200 rounded-md", className)}>
      <MenuBar editor={editor} />
      <EditorContent 
        editor={editor} 
        className="min-h-[200px] max-h-[400px] overflow-y-auto"
        placeholder={placeholder}
      />
    </div>
  )
}
