import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react'

import type { GetLabelsParams } from '@/services/LabelApi'



interface LabelCardProps extends GetLabelsParams {
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export const LabelCard: React.FC<LabelCardProps> = ({
  labelName,
  labelStatus,
  createdAt,
  updatedAt,
  color,
  onEdit,
  onDelete,
  onClick
}) => {


  const getStatusVariant = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'default'
      case 'COMPLETED': return 'secondary'
      case 'INACTIVE': return 'destructive'
      case 'DRAFT': return 'outline'
      default: return 'outline'
    }
  }


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  const isInactive = labelStatus?.toUpperCase() === 'INACTIVE'

  return (
    <Card
      className={`bg-white border-violet-500/10 rounded-xl overflow-hidden hover:bg-violet-500/[0.02] hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative shadow-sm hover:shadow-md ${isInactive ? 'opacity-60 grayscale' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-2 flex items-center gap-2">
            {color && (
              <div
                className="w-3.5 h-3.5 rounded-full border border-gray-200 shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              />
            )}
            <h4 className="text-sm font-bold text-[#111] leading-tight line-clamp-2" title={labelName}>
              {labelName || 'Unnamed Label'}
            </h4>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Badge
              variant={getStatusVariant(labelStatus)}
              className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider"
            >
              {labelStatus || 'UNKNOWN'}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-4 w-4 text-gray-400" />
                  </Button>
                }
              />

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onClick}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Label
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-red-500 focus:text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deactivate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg mt-auto">
          <div>
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Created</div>
            <div className="text-[#111] text-[10px] font-semibold">{formatDate(createdAt)}</div>
          </div>
          <div className="border-l border-gray-200 pl-2">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Updated</div>
            <div className="text-[#111] text-[10px] font-semibold">{formatDate(updatedAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>

  )
}

