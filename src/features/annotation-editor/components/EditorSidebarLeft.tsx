
import type { DataItem } from '../types'



interface EditorSidebarLeftProps {
  width: number
  items: DataItem[]
  currentIndex: number
  sessionAnnotations: any[]
  onItemSelect: (idx: number) => void
  onMouseDownResize: (e: React.MouseEvent) => void
}

export const EditorSidebarLeft: React.FC<EditorSidebarLeftProps> = ({
  width,
  items,
  currentIndex,
  sessionAnnotations,
  onItemSelect,
  onMouseDownResize
}) => {
  return (
    <div
      className="bg-[#16121f] border-r border-white/5 flex flex-col relative"
      style={{ width }}
    >
      <div className="p-4 border-b border-white/5">
        <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest">Data Items</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {items.map((item, idx) => {
          const itemId = (item as any).dataItemId || (item as any).dataitemId || item.itemId || (item as any).dataItem?.itemId || (item as any).id
          const annotation = sessionAnnotations.find(a => a.dataitemId === itemId)
          const status = annotation?.annotationStatus?.toUpperCase() || 'DRAFT'
          
          return (
            <div
              key={idx}
              onClick={() => onItemSelect(idx)}
              className={`group relative rounded-xl p-2 cursor-pointer transition-all duration-300 border ${
                currentIndex === idx
                  ? 'bg-violet-600/10 border-violet-500/50'
                  : 'border-transparent hover:bg-white/5'
              }`}
            >
              <div className="aspect-square rounded-lg bg-black/40 overflow-hidden mb-1 relative">
                <img
                  src={item.url || 'https://picsum.photos/seed/placeholder/100/100'}
                  alt={`Item ${idx}`}
                  className={`w-full h-full object-cover transition-opacity ${currentIndex === idx ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                />
                <div className="absolute top-1 right-1">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'APPROVED' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                    status === 'REJECTED' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                    status === 'SUBMITTED' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse' : 
                    'bg-gray-500'
                  }`} />
                </div>

              </div>
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono text-gray-500">#{idx + 1}</span>
                {status !== 'DRAFT' && (
                  <span className={`text-[8px] font-bold uppercase tracking-tighter ${
                    status === 'APPROVED' ? 'text-emerald-400' : status === 'REJECTED' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {status}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Resize Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500/50 transition-colors z-20"
        onMouseDown={onMouseDownResize}
      />
    </div>
  )
}
