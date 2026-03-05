import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import assignmentApi from '@/api/assignment'
import guidelineApi, { type Guideline } from '@/api/guideline'
import projectApi from '@/api/project'
import { themeClasses } from '@/styles'
import { DashboardTabs, type DashboardTabType } from '@/features/manager/components/dashboard/DashboardTabs'
import { useAuthStore } from '@/store/auth.store'

// ─── Status helpers ───────────────────────────────────────────────────────────

function getTaskStatusStyle(status: string) {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'done':
            return {
                badge: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                dot: 'bg-emerald-400',
                icon: 'task_alt',
            };
        case 'pending':
            return {
                badge: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                dot: 'bg-amber-400',
                icon: 'pending',
            };
        case 'active':
        case 'in progress':
            return {
                badge: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
                dot: 'bg-violet-400',
                icon: 'edit_note',
            };
        default:
            return {
                badge: 'border-gray-500/20 bg-gray-500/10 text-gray-400',
                dot: 'bg-gray-400',
                icon: 'radio_button_unchecked',
            };
    }
}

function getAnnotationStatusLabel(status: string) {
    switch (status) {
        case 'not_submitted': return 'Not Submitted';
        case 'needs_editing': return 'Needs Editing';
        case 'corrected': return 'Corrected';
        case 'submitted': return 'Submitted';
        default: return status;
    }
}

function getAnnotationStatusStyle(status: string) {
    switch (status) {
        case 'not_submitted':
            return 'text-gray-400';
        case 'needs_editing':
            return 'text-fuchsia-400';
        case 'corrected':
            return 'text-emerald-400';
        case 'submitted':
            return 'text-violet-400';
        default:
            return 'text-gray-400';
    }
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AssignmentHeader({ assignment }: { assignment: any }) {
    const completed = assignment.completedTasks ?? 0;
    const total = assignment.totalTasks ?? assignment.dataset?.totalItems ?? 1;
    const progress = Math.round((completed / total) * 100);

    const deadlineStr = assignment.dueDate || assignment.deadline || assignment.updatedAt || new Date().toISOString();
    const daysLeft = Math.ceil(
        (new Date(deadlineStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

    const title = assignment.assignmentName || assignment.title || 'Untitled Assignment';
    const id = assignment.assignmentId || assignment.id || 'N/A';
    const projectName = assignment.project?.projectName || assignment.project || 'Unknown Project';
    const description = assignment.descriptionAssignment || assignment.description || 'No description provided.';

    return (
        <div className="glass-panel rounded-2xl p-7 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-[50px] pointer-events-none" />

            <div className="relative z-10">
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                        {/* Breadcrumb label */}
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[14px] text-violet-400">assignment</span>
                            <span className="text-xs font-mono text-violet-400 tracking-widest uppercase">Assignment</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {title}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1 font-mono">{id}</p>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                            <span className="material-symbols-outlined text-[14px] text-violet-400">folder_special</span>
                            {projectName}
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border text-xs font-bold ${daysLeft <= 2 ? 'border-red-500/30 text-red-400' : daysLeft <= 5 ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Deadline passed'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-3xl">
                    {description}
                </p>

                {/* Progress Bar */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-xs font-mono text-violet-400 shrink-0">
                        {completed}/{total === 1 && completed === 0 ? 0 : total} tasks · {progress}%
                    </span>
                </div>
            </div>
        </div>
    );
}

function AnnotatorProjectDetail({ project }: { project: any }) {
    if (!project) return null;

    const getStatusColor = (status?: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400';
            case 'COMPLETED': return 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400';
            case 'PAUSED': return 'border-amber-500/30 bg-amber-500/10 text-amber-400';
            case 'ARCHIVE': return 'border-red-500/30 bg-red-500/10 text-red-400';
            default: return 'border-gray-500/30 bg-gray-500/10 text-gray-400';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    return (
        <div className="glass-panel rounded-2xl p-7 relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-violet-500/10 blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-fuchsia-500/10 blur-[50px] pointer-events-none" />

            <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-symbols-outlined text-[14px] text-violet-400">folder_special</span>
                            <span className="text-xs font-mono text-violet-400 tracking-widest uppercase">Project</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            {project.projectName || project.name}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1 font-mono">{project.projectId || project.id}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusColor(project.projectStatus || project.status)}`}>
                            <span className="material-symbols-outlined text-[14px]">flag</span>
                            {project.projectStatus || project.status || 'UNKNOWN'}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white mb-2">Description</h3>
                    <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
                        {project.description || <span className="text-gray-500 italic">No description provided for this project.</span>}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-6">
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Created At</p>
                        <p className="text-sm font-semibold text-gray-300">{formatDate(project.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-300">{formatDate(project.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GuidelineSection({ guideline }: { guideline: string }) {
    const [expanded, setExpanded] = useState(true);
    const lines = guideline.split('\n');

    return (
        <div className={`${themeClasses.backgrounds.card} border ${themeClasses.borders.violet20} rounded-2xl overflow-hidden transition-all duration-300`}>
            {/* Header */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-[16px] text-violet-400">menu_book</span>
                    </div>
                    <span className="font-semibold text-white text-sm">Annotation Guideline</span>
                </div>
                <span className={`material-symbols-outlined text-gray-400 text-[20px] transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {/* Content */}
            {expanded && (
                <div className="px-6 pb-6">
                    <div className="border-t border-white/5 pt-4">
                        <ul className="flex flex-col gap-2.5">
                            {lines.map((line, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-300 leading-relaxed">
                                    <span className="mt-1 w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-[10px] font-bold text-violet-400">
                                        {idx + 1}
                                    </span>
                                    <span>{line.replace(/^\d+\.\s*/, '')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}

/** Groups tasks by their batchLabel */
function groupTasksByBatch(tasks: any[]): Record<string, any[]> {
    return tasks.reduce<Record<string, any[]>>((acc, task) => {
        if (!acc[task.batchLabel]) acc[task.batchLabel] = [];
        acc[task.batchLabel].push(task);
        return acc;
    }, {});
}

function TaskCard({ task }: { task: any }) {
    const statusStyle = getTaskStatusStyle(task.taskStatus);
    const annotationLabel = getAnnotationStatusLabel(task.annotationStatus);
    const annotationStyle = getAnnotationStatusStyle(task.annotationStatus);

    return (
        <div
            className={`
                relative group rounded-xl p-4 cursor-pointer overflow-hidden
                bg-[#1a3a5c] border border-[#2a5a8c]/60
                hover:border-violet-500/50 hover:bg-[#1e4470] hover:shadow-[0_0_20px_rgba(139,92,246,0.15)]
                transition-all duration-300
            `}
        >
            {/* Top row: status info */}
            <div className="mb-3">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-300 mb-0.5">
                    <span className="font-semibold text-gray-400">Task_Status:</span>
                    <span className={`font-semibold ${statusStyle.badge.includes('emerald') ? 'text-emerald-400' : statusStyle.badge.includes('amber') ? 'text-amber-400' : statusStyle.badge.includes('violet') ? 'text-violet-400' : 'text-gray-400'}`}>
                        {task.taskStatus}
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-300">
                    <span className="font-semibold text-gray-400">Annotation_Status:</span>
                    <span className={`font-semibold ${annotationStyle}`}>{annotationLabel}</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mb-3" />

            {/* Task name + action */}
            <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">{task.name}</h4>
                <button className="flex items-center gap-1 text-[10px] font-bold text-violet-300 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                    <span>Open</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                </button>
            </div>

            {/* Corner accent */}
            <div className="absolute bottom-0 right-0 w-12 h-12 bg-violet-500/5 rounded-tl-full pointer-events-none" />
        </div>
    );
}

function TasksSection({ tasks }: { tasks: any[] }) {
    const grouped = groupTasksByBatch(tasks);

    return (
        <div>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px] text-fuchsia-400">grid_view</span>
                </div>
                <h2 className="text-lg font-bold text-white">Tasks</h2>
                <span className="text-xs font-mono text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                    {tasks.length} total
                </span>
            </div>

            {/* Batch groups */}
            <div className="flex flex-col gap-6">
                {Object.entries(grouped).map(([batchLabel, batchTasks]) => (
                    <div key={batchLabel}>
                        {/* Batch label */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className="h-px flex-1 bg-gradient-to-r from-violet-500/30 to-transparent" />
                            <span className="text-[11px] font-bold tracking-widest uppercase text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-0.5 rounded-full">
                                {batchLabel}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-l from-violet-500/30 to-transparent" />
                        </div>

                        {/* 2-column grid of cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {batchTasks.map(task => (
                                <TaskCard key={`${batchLabel}-${task.id}`} task={task} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}


// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AnnotatorDashboardPage() {
    // const assignment = ASSIGNMENT_DATA;

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
    const [guideline, setGuideline] = useState<Guideline | null>(null)
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
                    setAssignment(assignmentData)

                    // Fetch associated Guideline
                    const projectIdToFetch = assignmentData.projectId || assignmentData.project?.projectId;
                    if (projectIdToFetch) {
                        const guidelineRes = await guidelineApi.getByProject(projectIdToFetch)
                        const activeGuide = guidelineRes.data?.find((g: any) => g.status === 'ACTIVE') ?? null
                        setGuideline(activeGuide)

                        // Also fetch the project details for the project tab
                        const projectRes = await projectApi.getProjectById(projectIdToFetch)
                        setProjectDetail(projectRes.data?.data || projectRes.data)
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
                                const firstAssign = assignsList[0]
                                setAssignment(firstAssign)

                                const projectIdToFetch = firstAssign.projectId || firstAssign.project?.projectId;
                                if (projectIdToFetch) {
                                    const guidelineRes = await guidelineApi.getByProject(projectIdToFetch)
                                    const activeGuide = guidelineRes.data?.find((g: any) => g.status === 'ACTIVE') ?? null
                                    setGuideline(activeGuide)

                                    const projectRes = await projectApi.getProjectById(projectIdToFetch)
                                    setProjectDetail(projectRes.data?.data || projectRes.data)
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
                                    const firstProjId = projectsList[0].projectId || projectsList[0].id
                                    if (firstProjId) {
                                        const detailRes = await projectApi.getProjectById(firstProjId)
                                        setProjectDetail(detailRes.data?.data || detailRes.data)

                                        const guidelineRes = await guidelineApi.getByProject(firstProjId)
                                        const activeGuide = guidelineRes.data?.find((g: any) => g.status === 'ACTIVE') ?? null
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

    // ───────────────────────────────────────────

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
                                <GuidelineSection guideline={guideline.content} />
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
