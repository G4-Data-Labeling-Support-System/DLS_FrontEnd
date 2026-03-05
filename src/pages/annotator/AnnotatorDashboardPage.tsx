import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import assignmentApi from '@/api/assignment'
import guidelineApi, { type Guideline } from '@/api/guideline'
import { themeClasses } from '@/styles'

// ─── Mock Data ─────────────────────────────────────────────────────────────────

interface Task {
    id: number;
    name: string;
    batchLabel: string;
    taskStatus: string;
    annotationStatus: string;
}

interface Assignment {
    id: string;
    title: string;
    project: string;
    deadline: string;
    totalTasks: number;
    completedTasks: number;
    description: string;
    guideline: string;
    tasks: Task[];
}

const ASSIGNMENT_DATA: Assignment = {
    id: 'ASSIGN-001',
    title: 'Assignment 1 Detail',
    project: 'Object Detection — Urban Streets v3',
    deadline: '2026-03-10',
    totalTasks: 4,
    completedTasks: 1,
    description: 'You have been assigned a batch of images from the Urban Streets dataset. Each image requires bounding-box annotations around pedestrians, vehicles, and traffic signs. Please follow the annotation guidelines carefully to ensure consistent and high-quality labels.',
    guideline: `1. Draw tight bounding boxes — do not include background padding unless an object is partially occluded.\n2. Label every visible instance of each class, even if occluded more than 50%.\n3. Use the "Crowd" tag when more than 5 pedestrians overlap and individual boxes are not feasible.\n4. Minimum box size is 10 × 10 pixels; ignore objects smaller than this threshold.\n5. If an image is blurry or corrupted, mark it as "Unqualified" and move to the next item.\n6. Submit your batch for review within 48 hours of acceptance.`,
    tasks: [
        {
            id: 1,
            name: 'Task 1',
            batchLabel: 'Chờ review',
            taskStatus: 'Pending',
            annotationStatus: 'not_submitted',
        },
        {
            id: 2,
            name: 'Task 2',
            batchLabel: 'Cần fix lại',
            taskStatus: 'Pending',
            annotationStatus: 'needs_editing',
        },
        {
            id: 3,
            name: 'Task 3',
            batchLabel: 'Đã fix',
            taskStatus: 'Completed',
            annotationStatus: 'corrected',
        },
        {
            id: 4,
            name: 'Task 1',
            batchLabel: 'Cần fix lại',
            taskStatus: 'Pending',
            annotationStatus: 'needs_editing',
        },
    ],
};

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

function AssignmentHeader({ assignment }: { assignment: Assignment }) {
    const progress = Math.round((assignment.completedTasks / assignment.totalTasks) * 100);

    const daysLeft = Math.ceil(
        (new Date(assignment.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );

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
                            {assignment.title}
                        </h1>
                        <p className="text-sm text-gray-400 mt-1 font-mono">{assignment.id}</p>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                            <span className="material-symbols-outlined text-[14px] text-violet-400">folder_special</span>
                            {assignment.project}
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border text-xs font-bold ${daysLeft <= 2 ? 'border-red-500/30 text-red-400' : daysLeft <= 5 ? 'border-amber-500/30 text-amber-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                            <span className="material-symbols-outlined text-[14px]">schedule</span>
                            {daysLeft > 0 ? `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` : 'Deadline passed'}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-3xl">
                    {assignment.description}
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
                        {assignment.completedTasks}/{assignment.totalTasks} tasks · {progress}%
                    </span>
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
function groupTasksByBatch(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce<Record<string, Task[]>>((acc, task) => {
        if (!acc[task.batchLabel]) acc[task.batchLabel] = [];
        acc[task.batchLabel].push(task);
        return acc;
    }, {});
}

function TaskCard({ task }: { task: Task }) {
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

function TasksSection({ tasks }: { tasks: Task[] }) {
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

    const [assignment, setAssignment] = useState<any>(null)
    const [guideline, setGuideline] = useState<Guideline | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!assignmentId) return

        const fetchData = async () => {
            try {
                setLoading(true)

                // 1️⃣ Get Assignment Detail
                const assignmentRes = await assignmentApi.getAssignmentById(
                    assignmentId
                )

                const assignmentData = assignmentRes.data.data
                setAssignment(assignmentData)

                // 2️⃣ Get Guideline by projectId
                if (assignmentData.projectId) {
                    const guidelineRes = await guidelineApi.getByProject(
                        assignmentData.projectId
                    )

                    const activeGuide =
                        guidelineRes.data?.find(g => g.status === 'ACTIVE') ?? null

                    setGuideline(activeGuide)
                }
            } catch (err: any) {
                console.error(err)
                setError('Failed to load assignment')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [assignmentId])

    // ───────────────────────────────────────────

    if (loading) {
        return (
            <div className="text-center text-gray-400 py-20">
                Loading assignment...
            </div>
        )
    }

    if (error || !assignment) {
        return (
            <div className="text-center text-red-400 py-20">
                {error ?? 'Assignment not found'}
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-10">

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
        </div>
    );
}
