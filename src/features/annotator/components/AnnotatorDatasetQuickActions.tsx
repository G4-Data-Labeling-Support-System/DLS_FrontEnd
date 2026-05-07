import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FolderOpen, ChevronRight, Play, Zap } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { PATH_ANNOTATOR } from '@/routes/paths'



export const AnnotatorDatasetQuickActions: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Card className="h-full bg-white border-gray-200 rounded-2xl shadow-xl overflow-hidden">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
          <CardTitle className="text-lg font-bold text-[#111]">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-4 flex flex-col gap-4">
        <Button
          size="lg"
          className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20 font-bold tracking-wider"
          onClick={() => {}}
        >
          <Play className="w-4 h-4 mr-2 fill-current" />
          START ANNOTATING
        </Button>

        <Button
          variant="outline"
          className="w-full h-12 flex items-center justify-between border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900 px-4"
          onClick={() => navigate(PATH_ANNOTATOR.projects)}
        >
          <div className="flex items-center gap-3">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold uppercase tracking-wide">Projects & Assignments</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </Button>
      </CardContent>
    </Card>

  )
}

