import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Tag, FilterX } from 'lucide-react'

import { LabelCard } from '@/features/manager/components/dashboard/LabelCard'
import { useLabelsByDataset } from '@/features/manager/hooks/useLabels'



interface AnnotatorLabelListProps {
  datasetId: string
}

export const AnnotatorLabelList: React.FC<AnnotatorLabelListProps> = ({ datasetId }) => {
  const { data: labels = [], isLoading: loading } = useLabelsByDataset(datasetId)
  const [searchText, setSearchText] = useState<string>('')


  const filteredLabels = labels.filter(
    (label) => !searchText || label.labelName?.toLowerCase().includes(searchText.toLowerCase())
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    )
  }


  return (
    <div className="w-full animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-violet-500" />
          <h2 className="text-xl font-bold text-[#111] tracking-tight">Dataset Labels</h2>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search labels..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 w-full bg-white rounded-xl h-10 border-gray-200"
          />
        </div>
      </div>

      {filteredLabels.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <FilterX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No labels found for this dataset.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLabels.map((label) => (
            <LabelCard
              key={label.labelId}
              {...label}
            />
          ))}
        </div>
      )}
    </div>

  )
}

