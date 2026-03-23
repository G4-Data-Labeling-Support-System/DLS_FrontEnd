import { useParams, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'

import { AnnotatorDatasetCard } from '@/features/annotator'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'

export default function AnnotatorProjectDatasetsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate(`/annotator/projects/${projectId}`)}
      >
        Back to Project Detail
      </Button>

      {/* Tabs Menu */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab="dataset" />}

      {/* Tab Content */}
      <div className="mt-6 w-full">
        {projectId ? (
          <AnnotatorDatasetCard projectId={projectId} />
        ) : (
          <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
            Invalid Project ID.
          </div>
        )}
      </div>
    </div>
  )
}
