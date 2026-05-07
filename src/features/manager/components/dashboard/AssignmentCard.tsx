import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react'
import type { GetAssignmentsParams } from '@/services/AssignmentApi'



interface AssignmentCardProps extends GetAssignmentsParams {
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
  variant?: 'default' | 'compact'
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignmentName,
  status,
  createdAt,
  updatedAt,
  onEdit,
  onDelete,
  onClick,
  variant = 'default'
}) => {
  const getStatusVariant = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ASSIGNED': return 'outline'
      case 'IN_PROGRESS': return 'default'
      case 'REVIEWING': return 'secondary'
      case 'COMPLETED': return 'default'
      case 'INACTIVE': return 'destructive'
      default: return 'outline'
    }
  }


  // Status mapping using Assignment specific logic


  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  if (variant === 'compact') {
    return (
      <div
        className={`flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-violet-500/30 transition-all cursor-pointer group ${
          status?.toUpperCase() === 'INACTIVE' ? 'opacity-60 grayscale-[0.5]' : ''
        }`}
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <h4
            className="text-[#111] font-bold text-sm truncate pr-2"
            title={assignmentName || 'Unnamed Assignment'}
          >
            {assignmentName || 'Unnamed Assignment'}
          </h4>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            variant={getStatusVariant(status)}
            className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider"
          >
            {status || 'UNKNOWN'}
          </Badge>
          <span className="text-gray-500 text-[10px]">{formatDate(createdAt)}</span>
        </div>
      </div>

    )
  }

  return (
    <Card
      className={`bg-white border-violet-500/10 rounded-xl overflow-hidden hover:bg-violet-500/[0.02] hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative shadow-sm hover:shadow-md ${
        status?.toUpperCase() === 'INACTIVE' ? 'opacity-60 grayscale-[0.5]' : ''
      }`}
      onClick={onClick}
    >
      {assignmentName &&
      typeof assignmentName === 'object' &&
      ('projectName' in (assignmentName as object) ||
        'project_name' in (assignmentName as object)) ? (
        <div className="absolute top-2 left-4 z-10">
          <Badge variant="outline" className="bg-violet-50 border-violet-100 text-violet-600 text-[9px] font-bold">
            {String(
              (assignmentName as Record<string, unknown>).projectName ||
                (assignmentName as Record<string, unknown>).project_name
            )}
          </Badge>
        </div>
      ) : null}

      <CardHeader className={`p-4 ${assignmentName && typeof assignmentName === 'object' ? 'pt-8' : 'pt-4'} pb-2 space-y-0`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-bold text-[#111] line-clamp-1 flex-1 pr-2">
            {assignmentName || 'Unnamed Assignment'}
          </CardTitle>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Badge
              variant={getStatusVariant(status)}
              className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider"
            >
              {status || 'UNKNOWN'}
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
                  Edit
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Deactivate
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 mt-auto">
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
          <div>
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Created</div>
            <div className="text-[#111] text-xs font-semibold">{formatDate(createdAt)}</div>
          </div>
          <div className="border-l border-gray-200 pl-2">
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Updated</div>
            <div className="text-[#111] text-xs font-semibold">{formatDate(updatedAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>

  )
}

