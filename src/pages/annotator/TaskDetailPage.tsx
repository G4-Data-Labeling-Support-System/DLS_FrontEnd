import { useParams, useNavigate } from 'react-router-dom';
import getTaskStatusStyle from './components/StatusStyle';

const MOCK_TASK_DETAIL = {
    id: 'TASK-UUID-001',
    assignmentId: 'ASGN-UUID-123',
    taskType: 'classification',
    completedCount: 5,
    flagForReview: false,
    reviewStatus: 'not_reviewed',
    status: 'completed',
    createdAt: '2024-03-07T10:00:00Z',
    dataItems: [
        {
            id: 'item-1',
            filename: 'medical_scan_01.png',
            fileFormat: 'PNG',
            dataType: 'Image',
            uploadedAt: '2024-03-07T09:00:00Z',
            previewUrl: 'https://picsum.photos/seed/scan1/100/100'
        },
        {
            id: 'item-2',
            filename: 'medical_scan_02.png',
            fileFormat: 'PNG',
            dataType: 'Image',
            uploadedAt: '2024-03-07T09:05:00Z',
            previewUrl: 'https://picsum.photos/seed/scan2/100/100'
        },
        {
            id: 'item-3',
            filename: 'medical_scan_03.png',
            fileFormat: 'PNG',
            dataType: 'Image',
            uploadedAt: '2024-03-07T09:10:00Z',
            previewUrl: 'https://picsum.photos/seed/scan3/100/100'
        }
    ]
};

export default function TaskDetailPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const task = MOCK_TASK_DETAIL; // In real app, fetch by taskId
    const statusStyle = getTaskStatusStyle(task.status);

    return (
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pb-10 px-4 pt-4">
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-fit group"
            >
                <span className="material-symbols-outlined text-[20px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                <span className="text-sm font-medium">Back to Assignment</span>
            </button>

            {/* Header / Title */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-white">Task Details</h1>
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${statusStyle.badge}`}>
                        {task.status}
                    </span>
                </div>
                <p className="text-gray-500 text-sm font-mono">{taskId || task.id}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Detail Cards */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 border border-white/5">
                        <div className="flex items-center gap-2 text-violet-400 mb-2">
                            <span className="material-symbols-outlined text-[18px]">info</span>
                            <span className="text-xs font-bold uppercase tracking-wider">Information</span>
                        </div>

                        <DetailItem label="Assignment ID" value={task.assignmentId} isMono />
                        <DetailItem label="Task Type" value={task.taskType} isCapitalize />
                        <DetailItem label="Completed Count" value={task.completedCount.toString()} />
                        <DetailItem label="Review Status" value={task.reviewStatus.replace('_', ' ')} isCapitalize />
                        <DetailItem label="Flag for Review" value={task.flagForReview ? 'Yes' : 'No'} />
                        <DetailItem label="Created At" value={new Date(task.createdAt).toLocaleString()} />
                    </div>
                </div>

                {/* Right Side: Data Items Table */}
                <div className="lg:col-span-2">
                    <div className="glass-panel rounded-2xl p-6 border border-white/5 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <span className="material-symbols-outlined text-[18px]">database</span>
                                <span className="text-xs font-bold uppercase tracking-wider">Data Items</span>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">{task.dataItems.length} items total</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-separate border-spacing-y-3 -mt-3">
                                <thead>
                                    <tr className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                        <th className="px-4 pb-2">File</th>
                                        <th className="px-4 pb-2">Format</th>
                                        <th className="px-4 pb-2">Type</th>
                                        <th className="px-4 pb-2">Uploaded</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {task.dataItems.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="group cursor-pointer"
                                            onClick={() => navigate(`/annotator/task/${task.id}/annotate`, { state: { startIndex: index } })}
                                        >
                                            <td className="px-4 py-3 bg-white/5 rounded-l-xl border-y border-l border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-lg">
                                                        <img src={item.previewUrl} alt={item.filename} className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-200 truncate max-w-[150px]">{item.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 bg-white/5 border-y border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                                                <span className="text-xs font-mono text-gray-400">{item.fileFormat}</span>
                                            </td>
                                            <td className="px-4 py-3 bg-white/5 border-y border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                                                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase">
                                                    {item.dataType}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 bg-white/5 rounded-r-xl border-y border-r border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                                                <span className="text-[11px] text-gray-500">{new Date(item.uploadedAt).toLocaleDateString()}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value, isMono = false, isCapitalize = false }: { label: string, value: string, isMono?: boolean, isCapitalize?: boolean }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</span>
            <span className={`text-sm text-gray-200 ${isMono ? 'font-mono' : 'font-medium'} ${isCapitalize ? 'capitalize' : ''}`}>
                {value}
            </span>
        </div>
    );
}
