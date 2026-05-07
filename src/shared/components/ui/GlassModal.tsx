import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface GlassModalProps {
  open: boolean
  onCancel: () => void
  title?: React.ReactNode
  children: React.ReactNode
  width?: number
  contentClassName?: string
  destroyOnHidden?: boolean
}

export const GlassModal: React.FC<GlassModalProps> = ({
  open,
  onCancel,
  title,
  children,
  width = 600,
  contentClassName,
}) => {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent 
        className={cn(
          "max-w-[calc(100vw-2rem)] bg-[#14141e]/95 backdrop-blur-xl border-white/10 shadow-2xl p-0 overflow-hidden rounded-2xl",
          contentClassName
        )}
        style={{ width: width > 0 ? `${width}px` : 'auto' }}
      >
        {/* Holographic Accent Line */}
        <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60 z-50"></div>
        
        {title && (
          <DialogHeader className="px-6 pt-6 pb-0 border-none">
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}
        
        <div className="relative">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}
