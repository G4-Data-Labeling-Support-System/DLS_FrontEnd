import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Eye, MoreVertical } from 'lucide-react'


export interface ProjectCardProps {
  id: string
  projectName: string
  status?: string
  createdAt?: string
  updatedAt?: string
  description?: string
  onClick?: () => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projectName,
  status,
  createdAt,
  updatedAt,
  onClick
}) => {
  const getStatusVariant = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE': return 'default'
      case 'COMPLETED': return 'secondary'
      case 'PAUSED': return 'outline'
      case 'INACTIVE':
      case 'ARCHIVE': return 'destructive'
      default: return 'outline'
    }
  }




  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  return (
    <Card
      className={`bg-white border-violet-500/10 rounded-xl overflow-hidden hover:bg-violet-500/[0.02] hover:border-violet-500/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative shadow-sm hover:shadow-md ${
        status?.toUpperCase() === 'INACTIVE' ? 'opacity-60 grayscale-[0.5]' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="p-4 pb-2 space-y-0">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-bold text-[#111] line-clamp-1 flex-1 pr-2">
            {projectName || 'Unnamed Project'}
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

