import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import assignmentApi from '@/api/AssignmentApi'
import guidelineApi, { type GetGuidelinesParams } from '@/api/GuidelineApi'
import projectApi from '@/api/ProjectApi'
import { themeClasses } from '@/styles'
import { DashboardTabs, type DashboardTabType } from '@/features/manager/components/dashboard/DashboardTabs'
import { useAuthStore } from '@/store/auth.store'
import AssignmentHeader from './components/AssignmentHeader'
import TasksSection from './components/TaskSection'
import GuidelineSection from './components/GuidelineSection'
import AnnotatorProjectDetail from './components/AnnotationProjectDetail'

export default function AnnotatorDashboardPage() {
    const { assignmentId } = useParams<{ assignmentId: string }>()
    const location = useLocation()
    const navigate = useNavigate()

    const activeTab: DashboardTabType = location.pathname.includes('/assignment') ? 'assignment' : 'project'

    const handleTabChange = (tab: DashboardTabType) => {
        if (tab === 'project') {
            navigate(assignmentId ? `/annotator/project/${assignmentId}` : '/annotator/project')
        } else {
            navigate(assignmentId ? `/annotator/assignment/${assignmentId}` : '/annotator/assignment')
        }
    }

    const [assignment, setAssignment] = useState<any>(null)
    const [projectDetail, setProjectDetail] = useState<any>(null)
    const [guideline, setGuideline] = useState<GetGuidelinesParams | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { user } = useAuthStore()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                if (assignmentId) {
                    // Fetch Assignment Data
                    const assignmentRes = await assignmentApi.getAssignmentById(assignmentId)
                    const assignmentData = assignmentRes.data?.data || assignmentRes.data

                    // Normalize assignment
                    const normAssignment = {
                        ...assignmentData,
                        id: assignmentData.assignmentId || assignmentData.id,
                        name: assignmentData.assignmentName || assignmentData.name || assignmentData.title,
                        status: assignmentData.assignmentStatus || assignmentData.status,
                        description: assignmentData.descriptionAssignment || assignmentData.description,
                        projectId: assignmentData.projectId || assignmentData.project?.projectId || assignmentData.project?.id
                    };
                    setAssignment(normAssignment)

                    // Fetch associated Guideline
                    const projectIdToFetch = normAssignment.projectId;
                    if (projectIdToFetch) {
                        const guidelineRes = await guidelineApi.getGuidelines(projectIdToFetch)
                        const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
                        const activeGuide = Array.isArray(guidelinesList)
                            ? (guidelinesList.find((g: any) => g.status === 'ACTIVE' || g.status === 'active') ?? guidelinesList[0] ?? null)
                            : guidelinesList;
                        setGuideline(activeGuide)

                        // Also fetch the project details for the project tab
                        const projectRes = await projectApi.getProjectById(projectIdToFetch)
                        const rawProj = projectRes.data?.data || projectRes.data
                        setProjectDetail({
                            ...rawProj,
                            id: rawProj.projectId || rawProj.id,
                            name: rawProj.projectName || rawProj.name,
                            status: rawProj.projectStatus || rawProj.status
                        })
                    }
                } else {
                    // No assignmentId (e.g., viewing normal dashboard screen)
                    // Fetch the user's assignments
                    if (user?.id) {
                        let hasFetchedProject = false;
                        try {
                            const assignRes = await assignmentApi.getAssignmentsByAnnotator(user.id)
                            const assignsList = assignRes.data?.data || assignRes.data || []

                            if (assignsList.length > 0) {
                                const rawAssign = assignsList[0]
                                const normAssign = {
                                    ...rawAssign,
                                    id: rawAssign.assignmentId || rawAssign.id,
                                    name: rawAssign.assignmentName || rawAssign.name || rawAssign.title,
                                    status: rawAssign.assignmentStatus || rawAssign.status,
                                    description: rawAssign.descriptionAssignment || rawAssign.description,
                                    projectId: rawAssign.projectId || rawAssign.project?.projectId || rawAssign.project?.id
                                };
                                setAssignment(normAssign)

                                const projectIdToFetch = normAssign.projectId;
                                if (projectIdToFetch) {
                                    const guidelineRes = await guidelineApi.getGuidelines(projectIdToFetch)
                                    const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
                                    const activeGuide = Array.isArray(guidelinesList)
                                        ? (guidelinesList.find((g: any) => g.status === 'ACTIVE' || g.status === 'active') ?? guidelinesList[0] ?? null)
                                        : guidelinesList;
                                    setGuideline(activeGuide)

                                    const projectRes = await projectApi.getProjectById(projectIdToFetch)
                                    const rawProj = projectRes.data?.data || projectRes.data
                                    setProjectDetail({
                                        ...rawProj,
                                        id: rawProj.projectId || rawProj.id,
                                        name: rawProj.projectName || rawProj.name,
                                        status: rawProj.projectStatus || rawProj.status
                                    })
                                    hasFetchedProject = true;
                                }
                            }
                        } catch (err: any) {
                            console.warn("Could not fetch assignments or user has no assignments", err)
                        }

                        // Fallback: If we couldn't fetch a project via assignments, fetch projects directly
                        if (!hasFetchedProject) {
                            try {
                                const projectsRes = await projectApi.getProjects()
                                const projectsList = projectsRes.data?.data || projectsRes.data || []

                                if (projectsList.length > 0) {
                                    const firstProjRaw = projectsList[0];
                                    const firstProjId = firstProjRaw.projectId || firstProjRaw.id
                                    if (firstProjId) {
                                        const detailRes = await projectApi.getProjectById(firstProjId)
                                        const rawProj = detailRes.data?.data || detailRes.data
                                        setProjectDetail({
                                            ...rawProj,
                                            id: rawProj.projectId || rawProj.id,
                                            name: rawProj.projectName || rawProj.name,
                                            status: rawProj.projectStatus || rawProj.status
                                        })

                                        const guidelineRes = await guidelineApi.getGuidelines(firstProjId)
                                        const guidelinesList = guidelineRes.data?.data || guidelineRes.data || []
                                        const activeGuide = Array.isArray(guidelinesList)
                                            ? (guidelinesList.find((g: any) => g.status === 'ACTIVE' || g.status === 'active') ?? guidelinesList[0] ?? null)
                                            : guidelinesList;
                                        setGuideline(activeGuide)
                                        hasFetchedProject = true;
                                    }
                                }
                            } catch (err) {
                                console.error("Failed to fetch fallback projects", err)
                            }
                        }

                        if (!hasFetchedProject) {
                            // UI Display if totally empty
                            setAssignment(null)
                            // Guidelines should not be set
                        }
                    }
                }
            } catch (err: any) {
                console.error(err)
                setError('Failed to load data')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [assignmentId, user?.id])

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">
            <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

            {activeTab === 'project' && (
                loading ? (
                    <div className="text-center text-gray-400 py-20">
                        Loading project...
                    </div>
                ) : projectDetail ? (
                    <>
                        <AnnotatorProjectDetail project={projectDetail} />
                        {guideline && (
                            <div className="glass-panel border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <GuidelineSection guideline={guideline.content} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center text-gray-400 py-10 glass-panel rounded-2xl">
                        No project found.
                    </div>
                )
            )}

            {activeTab === 'assignment' && (
                loading ? (
                    <div className="text-center text-gray-400 py-20">
                        Loading assignment...
                    </div>
                ) : (error || !assignment) ? (
                    <div className="text-center text-red-400 py-20">
                        {error ?? 'Assignment not found'}
                    </div>
                ) : (
                    <>
                        {/* Title */}
                        <div className="flex items-center gap-2 -mb-2">
                            <span className="material-symbols-outlined text-[14px] text-gray-500">
                                arrow_downward
                            </span>
                            <span className="text-xs font-mono tracking-widest uppercase text-gray-500">
                                Assignment
                            </span>
                        </div>

                        <div className="glass-panel rounded-2xl p-6 sm:p-8 flex flex-col gap-6">

                            {/* Assignment Header */}
                            <AssignmentHeader assignment={assignment} />

                            {/* Guideline Section */}
                            {guideline && (
                                <GuidelineSection guideline={guideline.content ?? ""} />
                            )}

                            {/* Tasks Section */}
                            {assignment.tasks && (
                                <div
                                    className={`${themeClasses.backgrounds.card} border ${themeClasses.borders.violet10} rounded-2xl p-6`}
                                >
                                    <TasksSection tasks={assignment.tasks} />
                                </div>
                            )}
                        </div>
                    </>
                )
            )}
        </div>
    );
}
