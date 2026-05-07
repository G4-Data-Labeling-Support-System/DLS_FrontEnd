import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, Edit, Trash2, MoreVertical, Database } from 'lucide-react'
import type { GetDatasetsParams } from '@/services/DatasetApi'



interface DatasetCardProps extends GetDatasetsParams {
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
  variant?: 'default' | 'compact'
}

export const DatasetCard: React.FC<DatasetCardProps> = ({
  datasetName,
  totalItems,
  createdAt,
  dataItemStatus,
  datasetStatus,
  onEdit,
  onDelete,
  onClick,
  variant = 'default'
}) => {
  const currentStatus = datasetStatus || dataItemStatus

  const getStatusVariant = (s?: string) => {
    switch (s?.toUpperCase()) {
      case 'INACTIVE':
      case 'ARCHIVE': return 'destructive'
      case 'COMPLETED': return 'default'
      case 'PAUSED': return 'secondary'
      default: return 'outline'
    }
  }




  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  if (variant === 'compact') {
    return (
      <div
        className="flex flex-col gap-2 bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-violet-500/30 transition-all cursor-pointer group"
        onClick={onClick}
      >
        <div className="flex justify-between items-start">
          <h4
            className="text-[#111] font-bold text-sm truncate pr-2"
            title={datasetName || 'Unnamed Dataset'}
          >
            {datasetName || 'Unnamed Dataset'}
          </h4>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-[10px] bg-white border-gray-200">
            {totalItems || 0} Items
          </Badge>
          {currentStatus && (
            <Badge
              variant={getStatusVariant(currentStatus)}
              className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider"
            >
              {currentStatus.toUpperCase()}
            </Badge>
          )}
          <span className="text-gray-500 text-[10px] ml-auto">{formatDate(createdAt)}</span>
        </div>
      </div>

    )
  }

  return (
    <Card
      className={`bg-white border-violet-500/10 rounded-xl overflow-hidden hover:bg-violet-500/[0.02] hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative shadow-sm hover:shadow-md ${
        datasetStatus?.toUpperCase() === 'INACTIVE' ? 'opacity-60 grayscale-[0.5]' : ''
      }`}
      onClick={onClick}
    >
      {datasetName &&
      typeof datasetName === 'object' &&
      ('projectName' in (datasetName as object) || 'project_name' in (datasetName as object)) ? (
        <div className="absolute top-2 left-4 z-10">
          <Badge variant="outline" className="bg-violet-50 border-violet-100 text-violet-600 text-[9px] font-bold">
            {String(
              (datasetName as Record<string, unknown>).projectName ||
                (datasetName as Record<string, unknown>).project_name
            )}
          </Badge>
        </div>
      ) : null}

      <CardHeader className={`p-4 ${datasetName && typeof datasetName === 'object' ? 'pt-8' : 'pt-4'} pb-2 space-y-0`}>
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-bold text-[#111] line-clamp-1 flex-1 pr-2">
            {datasetName || 'Unnamed Dataset'}
          </CardTitle>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Badge
              variant={getStatusVariant(currentStatus)}
              className="text-[9px] px-1.5 py-0 font-bold uppercase tracking-wider"
            >
              {currentStatus?.toUpperCase() || 'UNKNOWN'}
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
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-100 font-mono">
            <Database className="w-3 h-3 mr-1 opacity-50" />
            {totalItems || 0} Items
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-2 bg-gray-50 p-3 rounded-lg">
          <div>
            <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Created</div>
            <div className="text-[#111] text-xs font-semibold">{formatDate(createdAt)}</div>
          </div>
        </div>
      </CardContent>
    </Card>

  )
}

