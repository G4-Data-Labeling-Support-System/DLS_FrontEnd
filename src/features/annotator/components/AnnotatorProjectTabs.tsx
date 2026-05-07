import { useNavigate } from 'react-router-dom'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"


export type AnnotatorProjectTabType = 'detail' | 'assignment' | 'dataset' | null

interface AnnotatorProjectTabsProps {
  projectId: string
  activeTab?: AnnotatorProjectTabType
}

export const AnnotatorProjectTabs: React.FC<AnnotatorProjectTabsProps> = ({
  projectId,
  activeTab
}) => {
  const navigate = useNavigate()

  return (
    <div className="mb-6">
      <Tabs value={activeTab || 'detail'} className="w-full">
        <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 gap-8">
          <TabsTrigger 
            value="detail" 
            onClick={() => navigate(`/annotator/projects/${projectId}`)}
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none pb-2 text-lg font-medium px-0 text-gray-500 data-[state=active]:text-[#111]"
          >
            Project Detail
          </TabsTrigger>
          <TabsTrigger 
            value="assignment" 
            onClick={() => navigate(`/annotator/projects/${projectId}/assignments`)}
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none pb-2 text-lg font-medium px-0 text-gray-500 data-[state=active]:text-[#111]"
          >
            Assignments
          </TabsTrigger>
          <TabsTrigger 
            value="dataset" 
            onClick={() => navigate(`/annotator/projects/${projectId}/datasets`)}
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-violet-500 rounded-none pb-2 text-lg font-medium px-0 text-gray-500 data-[state=active]:text-[#111]"
          >
            Datasets
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}



