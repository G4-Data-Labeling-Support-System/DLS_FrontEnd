import { useParams, useNavigate } from 'react-router-dom'
import { Spin, Button, Tag } from 'antd'
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons'

import { AnnotatorProjectTabs } from '@/features/annotator/components/AnnotatorProjectTabs'
import {
  useProjectById,
  useGuidelinesByProject
} from '@/features/manager/hooks/useProjectDetail'

interface Guideline {
  guideId?: string | number
  title?: string
  content?: string
  createdAt?: string
}

export default function AnnotatorProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const {
    data: project,
    isLoading: projectLoading,
    isError: projectError
  } = useProjectById(projectId || '')
  const { data: guidelines = [], isLoading: guidelinesLoading } = useGuidelinesByProject(projectId || '')

  const loading = projectLoading || guidelinesLoading

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
      case 'COMPLETED':
        return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
      case 'PAUSED':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-400'
      case 'ARCHIVE':
      case 'INACTIVE':
        return 'border-red-500/30 bg-red-500/10 text-red-400'
      default:
        return 'border-gray-500/30 bg-gray-500/10 text-gray-500'
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('vi-VN')
  }

  if (loading && !project) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spin indicator={<LoadingOutlined className="text-4xl text-violet-500" spin />} />
        <span className="mt-4 text-violet-400 font-mono">Loading Project...</span>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="p-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          className="text-gray-500 hover:text-[#111] mb-6"
          onClick={() => navigate('/annotator/projects')}
        >
          Back to Projects
        </Button>
        <div className="text-center text-gray-500 py-20 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700">
          Project not found or an error occurred.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 animate-fade-in relative overflow-hidden min-h-screen">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Back Button */}
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        className="text-gray-500 hover:text-[#111] mb-6 relative z-10"
        onClick={() => navigate('/annotator/projects')}
      >
        Back to Projects
      </Button>

      {/* Tabs Menu */}
      {projectId && <AnnotatorProjectTabs projectId={projectId} activeTab="detail" />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2 relative z-10">
        
        {/* Left: Project Information */}
        <div className="glass-panel rounded-2xl p-7 relative overflow-hidden flex flex-col border border-gray-200 bg-[#1A1625]/60 backdrop-blur-md shadow-xl">
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-[50px] pointer-events-none" />

          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[14px] text-violet-400">
                    folder_special
                  </span>
                  <span className="text-xs font-mono text-violet-400 tracking-widest uppercase font-bold">
                    Project Information
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#111] tracking-tight">
                  {project.projectName}
                </h1>
                <p className="text-sm text-gray-500 mt-1 font-mono hover:text-gray-600 transition-colors cursor-default">
                  {project.projectId}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold uppercase ${getStatusColor(project.projectStatus)}`}
                >
                  <span className="material-symbols-outlined text-[14px]">flag</span>
                  {project.projectStatus || 'UNKNOWN'}
                </div>
              </div>
            </div>

            <div className="mb-6 flex-1">
              <h3 className="text-sm font-semibold text-[#111] mb-2">Description</h3>
              <p className="text-sm text-gray-600 leading-relaxed max-w-3xl">
                {project.description || (
                  <span className="text-gray-500 italic">No description provided for this project.</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-300 pt-4 mt-auto">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Created At</p>
                <p className="text-sm font-semibold text-gray-600">{formatDate(project.createdAt)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-sm font-semibold text-gray-600">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Project Guidelines */}
        <div className="bg-[#1A1625]/60 backdrop-blur-md border border-violet-500/20 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full min-h-[400px]">
          <div className="w-full flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#231e31]/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[16px] text-emerald-400">menu_book</span>
              </div>
              <span className="font-semibold text-[#111] text-base font-display">Project Guidelines</span>
            </div>
            <Tag color="#10b981" className="border-0 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 border shadow-inner rounded-full font-bold px-3 py-0.5 m-0 text-xs">
              {guidelines.length} total
            </Tag>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {guidelines.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-60">
                <span className="material-symbols-outlined text-5xl mb-3 text-gray-600">article</span>
                <p className="text-gray-500 text-sm">No guidelines available</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {guidelines.map((guideline: Guideline, index: number) => (
                  <div
                    key={guideline.guideId || index}
                    className="flex flex-col gap-3 bg-white/5 p-5 rounded-xl border border-gray-300 hover:border-emerald-500/30 transition-all shadow-inner group"
                  >
                    <div className="flex justify-between items-start gap-2 border-b border-gray-200 pb-3">
                      <div className="flex items-center gap-3 font-display text-[#111] font-semibold">
                         <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center justify-center font-bold font-sans">
                           {index + 1}
                         </span>
                        <h4 className="truncate" title={guideline.title || 'Guideline'}>
                          {guideline.title || 'Guideline'}
                        </h4>
                      </div>
                    </div>
                    
                    <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed mt-1">
                      {guideline.content || 'No content provided.'}
                    </div>
                    
                    <div className="mt-2 text-[10px] text-gray-500 tracking-wider uppercase font-medium mt-auto w-full text-right">
                      {formatDate(guideline.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

