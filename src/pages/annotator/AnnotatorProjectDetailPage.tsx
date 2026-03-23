import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'

import { useAuthStore } from '@/store/auth.store'
import projectApi from '@/api/ProjectApi'
import guidelineApi from '@/api/GuidelineApi'

import { 
  AnnotationProjectDetail, 
  GuidelineSection 
} from '@/features/annotator'
import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'

export default function AnnotatorProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [projectDetail, setProjectDetail] = useState<any>(null)
  const [guideline, setGuideline] = useState<any>(null)
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjectData = async () => {
      if (!projectId || !user?.id) return

      try {
        setLoading(true)
        setError(null)

        // 1. Fetch Project Details
        const projectRes = await projectApi.getProjectById(projectId)
        const rawProj = projectRes.data?.data || projectRes.data
        const pStatus = (rawProj.projectStatus || rawProj.status || '').toUpperCase()
        
        if (pStatus && pStatus !== 'INACTIVE') {
          setProjectDetail({
            ...rawProj,
            id: rawProj.projectId || rawProj.id,
            name: rawProj.projectName || rawProj.name,
            status: rawProj.projectStatus || rawProj.status
          })
        } else {
          setError('Project is inactive or not found.')
          return
        }

        // 2. Fetch Guideline
        const guidelineRes = await guidelineApi.getGuidelines(projectId)
        const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
        const activeGuide = Array.isArray(guidelinesList)
          ? (guidelinesList.find((g: any) => g.status === 'ACTIVE' || g.status === 'active') ??
             guidelinesList[0] ??
             null)
          : guidelinesList
        setGuideline(activeGuide)

        // Removed assignments fetching from this page to optimize performance.
      } catch (err) {
        console.error('Failed to fetch project details:', err)
        setError('Failed to load project details.')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId, user?.id])

  if (loading && !projectDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="mt-4 text-violet-400 font-mono">Loading Project...</span>
      </div>
    )
  }

  if (error || !projectDetail) {
    return (
      <div className="p-6">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          className="text-gray-400 hover:text-white mb-6"
          onClick={() => navigate('/annotator/projects')}
        >
          Back to Projects
        </Button>
        <div className="text-center text-gray-400 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          {error || 'Project not found.'}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Back Button */}
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        className="text-gray-400 hover:text-white mb-6"
        onClick={() => navigate('/annotator/projects')}
      >
        Back to Projects
      </Button>

      {/* Tabs Menu at the True Top */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab={null} />}

      {/* Top Panel: Project Info & Guideline */}
      <div className="rounded-2xl grid md:grid-cols-2 sm:grid-cols-1 gap-6 mb-8 mt-4">
        <AnnotationProjectDetail project={projectDetail} />
        {guideline && <GuidelineSection guideline={guideline.content} />}
      </div>
    </div>
  )
}
