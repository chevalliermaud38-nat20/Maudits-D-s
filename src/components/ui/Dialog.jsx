import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative z-50 bg-background rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ className, children }) {
  return (
    <div className={cn("px-6 py-4 border-b", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ className, children }) {
  return (
    <h2 className={cn("text-lg font-semibold", className)}>
      {children}
    </h2>
  )
}

export function DialogContent({ className, children }) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  )
}
