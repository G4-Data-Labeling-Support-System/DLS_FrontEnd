import TaskCard from './TaskCard'

/** Groups tasks by their batchLabel */
function groupTasksByBatch(tasks: any[]): Record<string, any[]> {
  return tasks.reduce<Record<string, any[]>>((acc, task) => {
    if (!acc[task.batchLabel]) acc[task.batchLabel] = []
    acc[task.batchLabel].push(task)
    return acc
  }, {})
}

export default function TasksSection({ tasks }: { tasks: any[] }) {
  const grouped = groupTasksByBatch(tasks)

<<<<<<< Updated upstream
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
=======
  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-[16px] text-fuchsia-400">grid_view</span>
>>>>>>> Stashed changes
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
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {batchTasks.map((task) => (
                <TaskCard key={`${batchLabel}-${task.id}`} task={task} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
