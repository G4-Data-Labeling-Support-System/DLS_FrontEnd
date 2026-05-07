import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Undo2, Redo2, Plus, Minus, RotateCcw, Hand, Square, Hexagon } from 'lucide-react'



interface AnnotationToolbarProps {
  tool: 'pan' | 'box' | 'polygon'
  zoom: number
  canUndo: boolean
  canRedo: boolean
  onToolChange: (tool: 'pan' | 'box' | 'polygon') => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  onFinishPolygon: () => void
  onClearAll: () => void
  onSubmit: () => void
  isDirty: boolean
}

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  tool,
  zoom,
  canUndo,
  canRedo,
  onToolChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFinishPolygon,
  onClearAll,
  onSubmit,
  isDirty
}) => {
  return (
    <TooltipProvider delay={300}>

      <div className="h-14 bg-[#16121f] border-b border-white/5 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={tool === 'pan' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolChange('pan')}
                    className={`w-9 h-9 rounded-lg ${tool === 'pan' ? 'bg-violet-600 hover:bg-violet-700' : 'text-gray-400 hover:bg-white/10'}`}
                  >
                    <Hand className="w-4 h-4" />
                  </Button>
                }
              />

              <TooltipContent side="bottom">Pan tool (H)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={tool === 'box' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolChange('box')}
                    className={`w-9 h-9 rounded-lg ${tool === 'box' ? 'bg-violet-600 hover:bg-violet-700' : 'text-gray-400 hover:bg-white/10'}`}
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                }
              />

              <TooltipContent side="bottom">Bounding Box (B)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant={tool === 'polygon' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => onToolChange('polygon')}
                    className={`w-9 h-9 rounded-lg ${tool === 'polygon' ? 'bg-violet-600 hover:bg-violet-700' : 'text-gray-400 hover:bg-white/10'}`}
                  >
                    <Hexagon className="w-4 h-4" />

                  </Button>
                }
              />

              <TooltipContent side="bottom">Polygon tool (P)</TooltipContent>
            </Tooltip>
          </div>

          {tool === 'polygon' && (
            <Button
              variant="outline"
              size="sm"
              onClick={onFinishPolygon}
              className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold px-4 rounded-xl hover:bg-emerald-500/20"
            >
              Finish Polygon
            </Button>
          )}

          <Separator orientation="vertical" className="bg-white/10 h-8" />

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="w-9 h-9 rounded-lg text-gray-400 hover:bg-white/10 disabled:opacity-20"
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                }
              />

              <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="w-9 h-9 rounded-lg text-gray-400 hover:bg-white/10 disabled:opacity-20"
                  >
                    <Redo2 className="w-4 h-4" />
                  </Button>
                }
              />

              <TooltipContent side="bottom">Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>
          </div>

          <Separator orientation="vertical" className="bg-white/10 h-8" />

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl">
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomOut}
              className="w-8 h-8 text-gray-400 hover:bg-white/10"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-[10px] font-mono text-violet-400 w-12 text-center font-bold">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onZoomIn}
              className="w-8 h-8 text-gray-400 hover:bg-white/10"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onZoomReset}
                    className="w-8 h-8 text-gray-400 hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                }
              />

              <TooltipContent side="bottom">Reset Zoom</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="link"
            size="sm"
            onClick={onClearAll}
            className="text-gray-500 font-bold hover:text-white no-underline"
          >
            Reset Changes
          </Button>
          <Button
            onClick={onSubmit}
            className={`h-10 px-6 rounded-xl text-xs font-bold border-none shadow-lg transition-all ${
              isDirty
                ? 'bg-violet-600 hover:bg-violet-700 text-white'
                : 'bg-white/5 text-gray-500 cursor-default hover:bg-white/5'
            }`}
          >
            Submit Work
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}
