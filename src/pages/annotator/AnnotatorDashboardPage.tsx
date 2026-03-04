import { FolderOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { themeClasses } from '@/styles';
import { Button } from '@/shared/components/ui/Button';

export default function AnnotatorDashboardPage() {

    // Mock Data based on the UI provided
    const tasks = [
        { id: 1, name: 'Object Detection - Cityscapes', taskId: '#TASK-8842', progress: 45, status: 'Active', guidelines: 'View PDF', guidelinesPdf: true, action: 'Resume Labeling', actionType: 'resume' },
        { id: 2, name: 'Lane Segmentation v2', taskId: '#TASK-9102', progress: 12, status: 'In Progress', guidelines: 'View Wiki', guidelinesPdf: false, action: 'Start Labeling', actionType: 'start' },
        { id: 3, name: 'Pedestrian Tracking', taskId: '#TASK-7731', progress: 0, status: 'To-Do', guidelines: 'View PDF', guidelinesPdf: true, action: 'Start Labeling', actionType: 'start' },
        { id: 4, name: 'Signage Classification', taskId: '#TASK-8220', progress: 88, status: 'Review', guidelines: 'View Doc', guidelinesPdf: false, action: 'Open Review', actionType: 'review' },
        { id: 5, name: 'Lidar Point Cloud', taskId: '#TASK-9921', progress: 100, status: 'Done', guidelines: 'View PDF', guidelinesPdf: true, action: 'Finalized', actionType: 'done' },
    ];



    const upcomingDeadlines = [
        { id: 1, name: 'Lane Seg. v2', taskId: '#TASK-9102', timeLeft: '4h Left', done: '75%', color: 'text-amber-500' },
        { id: 2, name: 'Signage Classif.', taskId: '#TASK-8220', timeLeft: 'Tomorrow', done: '10%', color: 'text-gray-400' },
        { id: 3, name: 'Pedestrian Track.', taskId: '#TASK-7731', timeLeft: 'Oct 24', done: '0%', color: 'text-gray-400' },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-6 w-full h-full">

            {/* Left Column (Main Content) */}
            <div className="flex-1 flex flex-col gap-6">

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Tasks */}
                    <div className={`${themeClasses.cards.glass} p-5 rounded-2xl flex flex-col justify-between border !border-white/5 h-28`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">Total Tasks</span>
                            <FolderOutlined className="text-gray-500 text-lg" />
                        </div>
                        <span className="text-4xl font-bold text-white">142</span>
                    </div>

                    {/* Completed */}
                    <div className={`${themeClasses.cards.glass} p-5 rounded-2xl flex flex-col justify-between border !border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent h-28`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold tracking-widest text-emerald-500 uppercase">Completed</span>
                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                <CheckCircleOutlined className="text-emerald-500 opacity-80" />
                            </div>
                        </div>
                        <span className="text-4xl font-bold text-emerald-400 shadow-emerald-500/20 drop-shadow-md">89</span>
                    </div>

                    {/* In Progress */}
                    <div className={`${themeClasses.cards.glass} p-5 rounded-2xl flex flex-col justify-between border !border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-500/5 to-transparent h-28`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold tracking-widest text-fuchsia-500 uppercase">In Progress</span>
                            <div className="w-6 h-6 rounded-full bg-fuchsia-500/10 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 ml-0.5"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 ml-0.5"></div>
                            </div>
                        </div>
                        <span className="text-4xl font-bold text-fuchsia-400 shadow-fuchsia-500/20 drop-shadow-md">12</span>
                    </div>

                    {/* To-Do */}
                    <div className={`${themeClasses.cards.glass} p-5 rounded-2xl flex flex-col justify-between border !border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-transparent h-28`}>
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase">To-Do</span>
                            <div className="w-6 h-6 rounded-md border border-violet-500/30 flex items-center justify-center">
                                <div className="w-3 h-3 border border-violet-500/50 rounded-sm bg-violet-500/10"></div>
                            </div>
                        </div>
                        <span className="text-4xl font-bold text-violet-300 shadow-violet-500/20 drop-shadow-md">41</span>
                    </div>
                </div>

                {/* Active Task Queue Table */}
                <div className={`glass-card flex flex-col overflow-hidden rounded-xl mt-4`}>
                    <div className={`border-b ${themeClasses.borders.white5} px-6 py-5 flex justify-between items-center ${themeClasses.backgrounds.card}`}>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold text-white">Active Task Queue</h3>
                            <p className={`text-sm ${themeClasses.text.secondary} font-body`}>
                                List of labeling tasks assigned to you
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="group relative flex items-center gap-2 overflow-hidden px-4 py-2 font-body text-sm font-semibold border-white/10 text-gray-300"
                            >
                                <span className="material-symbols-outlined text-[16px]">filter_list</span>
                                <span>Filter</span>
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={`text-[11px] uppercase ${themeClasses.text.tertiary} font-bold tracking-wider border-b ${themeClasses.borders.white5}`}>
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Project Name</th>
                                    <th className="px-6 py-4 font-semibold">Task ID</th>
                                    <th className="px-6 py-4 font-semibold">Progress</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold">Guidelines</th>
                                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${themeClasses.borders.white5} font-body text-sm`}>
                                {tasks.map((task) => {
                                    // Status Badges Colors
                                    let statusBadge = "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400"; // Active
                                    let progressColor = "from-fuchsia-600 to-violet-600";

                                    if (task.status === 'In Progress') {
                                        statusBadge = "border-blue-500/20 bg-blue-500/10 text-blue-400";
                                        progressColor = "from-violet-600 to-fuchsia-600";
                                    } else if (task.status === 'To-Do') {
                                        statusBadge = "border-gray-500/20 bg-gray-500/10 text-gray-400";
                                        progressColor = "from-gray-600 to-gray-500";
                                    } else if (task.status === 'Review') {
                                        statusBadge = "border-amber-500/20 bg-amber-500/10 text-amber-400";
                                        progressColor = "from-fuchsia-500 to-amber-500";
                                    } else if (task.status === 'Done') {
                                        statusBadge = "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
                                        progressColor = "from-emerald-400 to-emerald-500";
                                    }

                                    // Action Items for Dropdown (Optional if we want to mimic exact Admin behavior, 
                                    // but Mockup shows a direct action button. We'll stick closer to Mockup while using Admin Button).
                                    const isDone = task.actionType === 'done';
                                    const isReview = task.actionType === 'review';

                                    return (
                                        <tr key={task.id} className={`group transition-colors hover:${themeClasses.backgrounds.whiteAlpha5}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${task.status === 'Active' ? 'bg-blue-500/20 text-blue-400' :
                                                        task.status === 'To-Do' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                                                            task.status === 'Done' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-500'
                                                        }`}>
                                                        <span className="material-symbols-outlined text-[16px]">category</span>
                                                    </div>
                                                    <span className="font-bold text-white text-[14px]">
                                                        {task.name}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-mono ${themeClasses.text.secondary}`}>{task.taskId}</span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1 w-32">
                                                    <span className={`text-[10px] ${themeClasses.text.secondary}`}>{task.progress}%</span>
                                                    <div className={`h-1.5 w-full bg-white/5 rounded-full overflow-hidden`}>
                                                        <div className={`h-full bg-gradient-to-r ${progressColor} rounded-full`} style={{ width: `${task.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                                                    {task.status}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <button className={`text-[12px] ${themeClasses.text.tertiary} hover:text-white flex items-center gap-1.5 transition`}>
                                                    {task.guidelines}
                                                    <span className="material-symbols-outlined text-[14px] opacity-70">open_in_new</span>
                                                </button>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant={isDone ? 'secondary' : isReview ? 'secondary' : 'primary'}
                                                    size="sm"
                                                    disabled={isDone}
                                                    className={`px-4 py-1.5 text-xs font-bold ${!isDone && !isReview ? 'shadow-[0_0_15px_rgba(217,70,239,0.3)] bg-fuchsia-600 hover:bg-fuchsia-500' : ''
                                                        }`}
                                                >
                                                    {task.action}
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0 mt-2">

                {/* Urgent Deadlines Title */}
                <div className="flex items-center gap-2 mb-[-8px]">
                    <ClockCircleOutlined className="text-fuchsia-400" />
                    <h3 className="text-white font-bold text-lg">Urgent Deadlines</h3>
                </div>

                {/* Deadline Timer Card */}
                <div className="rounded-2xl bg-gradient-to-b from-fuchsia-900/40 to-[#161320] border border-fuchsia-500/30 p-5 shadow-[0_0_30px_rgba(217,70,239,0.1)] relative overflow-hidden">
                    {/* Glowing background effect */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/20 blur-[40px] rounded-full pointer-events-none"></div>

                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <span className="text-[10px] font-bold tracking-widest text-fuchsia-400 bg-fuchsia-500/10 px-2 py-1 rounded">EXPIRING SOON</span>
                        <span className="text-xs font-mono text-gray-400">#TASK-9921</span>
                    </div>

                    <div className="flex justify-center border-b border-white/5 pb-4 mb-4 relative z-10">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">02:14:33</h2>
                            <div className="flex gap-4 justify-center text-[9px] text-gray-500 font-bold tracking-widest mt-1">
                                <span>HRS</span>
                                <span>MIN</span>
                                <span>SEC</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <h4 className="text-sm font-semibold text-gray-200 mb-1">Lidar Point Cloud - Sector 7</h4>
                        <div className="flex items-center gap-1.5 mb-5">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-[10px] text-gray-400">High Priority</span>
                        </div>
                        <button className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors">
                            Jump to Task
                        </button>
                    </div>
                </div>

                {/* Upcoming Due Dates */}
                <div className="rounded-2xl bg-[#1c1827] border border-white/5 p-5">
                    <h3 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Upcoming Due Dates</h3>
                    <div className="flex flex-col gap-4">
                        {upcomingDeadlines.map((item, index) => (
                            <div key={item.id} className={`flex justify-between items-center ${index !== upcomingDeadlines.length - 1 ? 'border-b border-white/5 pb-4' : ''}`}>
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-300">{item.name}</h4>
                                    <span className="text-[10px] font-mono text-gray-500">{item.taskId}</span>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xs font-bold ${item.color}`}>{item.timeLeft}</div>
                                    <div className="text-[10px] text-gray-500">{item.done} done</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 flex items-center justify-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-white transition-colors">
                        View Full Calendar <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                </div>

            </div>

        </div>
    );
}
