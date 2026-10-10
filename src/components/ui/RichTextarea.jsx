import { useState } from 'react'
import { Bold, Italic, Underline } from 'lucide-react'
import { Button } from './Button'
import { Textarea } from './Textarea'

export function RichTextarea({ value, onChange, placeholder, rows = 3 }) {
  const insertText = (before, after) => {
    const textarea = document.getElementById('rich-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const beforeText = text.substring(0, start)
    const selectedText = text.substring(start, end)
    const afterText = text.substring(end)
    
    const newText = beforeText + before + selectedText + after + afterText
    onChange(newText)
    
    // Restaurer le focus et la position du curseur
    setTimeout(() => {
      textarea.focus()
      const newPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertText('**', '**')}
          title="Gras"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertText('*', '*')}
          title="Italique"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertText('__', '__')}
          title="Souligné"
        >
          <Underline className="w-4 h-4" />
        </Button>
      </div>
      <Textarea
        id="rich-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  )
}
