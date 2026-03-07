import getTaskStatusStyle, { getAnnotationStatusLabel, getAnnotationStatusStyle } from "./StatusStyle";

export default function TaskCard({ task }: { task: any }) {
    const taskStatus = task.taskStatus || task.status || 'PENDING';
    const taskName = task.name || task.filename || 'Untitled Task';

    const statusStyle = getTaskStatusStyle(taskStatus);
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
                        {taskStatus}
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
                <h4 className="text-base font-bold text-white">{taskName}</h4>
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