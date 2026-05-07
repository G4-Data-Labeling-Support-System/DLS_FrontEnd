import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label as ShadcnLabel } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { History, Trash2, Info } from 'lucide-react'
import type { Label, Shape } from '../types'



interface EditorSidebarRightProps {
  width: number
  labels: Label[]
  selectedLabels: string[]
  currentLabel: Label | null
  shapes: Shape[]
  comment: string
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | null
  annotationReviews: any[]
  onLabelToggle: (label: Label) => void
  onCommentChange: (val: string) => void
  onConfidenceChange: (val: 'LOW' | 'MEDIUM' | 'HIGH') => void
  onRemoveShape: (idx: number) => void
  onMouseDownResize: (e: React.MouseEvent) => void
}

export const EditorSidebarRight: React.FC<EditorSidebarRightProps> = ({
  width,
  labels,
  selectedLabels,
  currentLabel,
  shapes,
  comment,
  confidence,
  annotationReviews,
  onLabelToggle,
  onCommentChange,
  onConfidenceChange,
  onRemoveShape,
  onMouseDownResize
}) => {
  return (
    <div
      className="bg-[#16121f] border-l border-white/5 flex flex-col relative"
      style={{ width }}
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-violet-500/50 transition-colors z-20"
        onMouseDown={onMouseDownResize}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        {/* Labels Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Info className="w-3 h-3" />
              Available Labels
            </h3>
            <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px]">
              {labels.length} total
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {labels.map((l) => (
              <button
                key={l.labelId}
                onClick={() => onLabelToggle(l)}
                className={`group relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300 ${
                  selectedLabels.includes(l.labelId)
                    ? 'bg-violet-500/10 border-violet-500/50 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full shadow-sm"
                  style={{ backgroundColor: l.color }}
                />
                <span className="text-xs font-medium">{l.labelName}</span>
                {currentLabel?.labelId === l.labelId && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-violet-400 rounded-full animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* Confidence Section */}
        <div>
          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Confidence Score</h3>
          <RadioGroup
            value={confidence || ''}
            onValueChange={(val) => onConfidenceChange(val as any)}
            className="grid grid-cols-3 gap-2"
          >
            {['LOW', 'MEDIUM', 'HIGH'].map((c) => (
              <div key={c} className="flex items-center">
                <RadioGroupItem value={c} id={`conf-${c}`} className="sr-only" />
                <ShadcnLabel
                  htmlFor={`conf-${c}`}
                  className={`flex-1 h-10 flex items-center justify-center rounded-xl bg-white/5 border-none text-xs font-bold transition-all cursor-pointer hover:bg-white/10 ${
                    confidence === c ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-500'
                  }`}
                >
                  {c}
                </ShadcnLabel>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator className="bg-white/5" />

        {/* Shapes/Objects List */}
        <div>
          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Objects ({shapes.length})</h3>
          <div className="space-y-2">
            {shapes.map((s, i) => (
              <div
                key={i}
                className="group flex items-center justify-between p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: s.color }} />
                  <div>
                    <p className="text-xs font-bold text-white leading-none mb-1">{s.label}</p>
                    <p className="text-[10px] text-gray-500 font-mono uppercase">{s.type.replace('_', ' ')}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveShape(i)}
                  className="opacity-0 group-hover:opacity-100 h-8 w-8 hover:bg-red-500/10 text-red-400 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* Annotator Comment */}
        <div>
          <h3 className="text-xs font-mono text-gray-400 uppercase tracking-widest mb-4">Annotator Comment</h3>
          <Textarea
            rows={3}
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder="Add your notes here..."
            className="bg-white/5 border-white/5 text-white rounded-xl text-xs hover:border-white/10 focus-visible:ring-violet-500/50 shadow-none resize-none"
          />
        </div>

        {/* Reviewer Feedback */}
        {annotationReviews.length > 0 && (
          <>
            <Separator className="bg-white/5" />
            <div className="space-y-4">
              <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <History className="w-3 h-3" />
                Review History
              </h3>
              <div className="space-y-3">
                {annotationReviews.map((rev, i) => (
                  <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant={rev.reviewStatus === 'REJECTED' ? 'destructive' : 'default'} className="text-[10px] font-bold px-2 py-0">
                        {rev.reviewStatus}
                      </Badge>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 italic leading-relaxed">"{rev.comment || 'No comment'}"</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
