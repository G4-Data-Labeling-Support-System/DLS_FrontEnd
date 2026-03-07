import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const MOCK_DATA_ITEMS = [
    {
        id: 'item-1',
        filename: 'medical_scan_01.png',
        url: 'https://picsum.photos/seed/scan1/800/600',
        dataType: 'Image',
        geometry: {
            type: 'polygon',
            coordinates: [[10, 20], [30, 40], [50, 60]]
        }
    },
    {
        id: 'item-2',
        filename: 'medical_scan_02.png',
        url: 'https://picsum.photos/seed/scan2/800/600',
        dataType: 'Image',
        geometry: {
            type: 'bounding_box',
            x: 100, y: 150, width: 200, height: 180
        }
    },
    {
        id: 'item-3',
        filename: 'medical_scan_03.png',
        url: 'https://picsum.photos/seed/scan3/800/600',
        dataType: 'Image',
        geometry: {
            type: 'point',
            x: 450, y: 320
        }
    }
];

const AVAILABLE_LABELS = ['Car', 'People', 'Tree', 'Sign', 'Building', 'Road'];

export default function AnnotationPage() {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    // Get starting index from state if passed, otherwise 0
    const startIdx = (location.state as any)?.startIndex || 0;
    const [currentIndex, setCurrentIndex] = useState(startIdx);
    const [selectedLabels, setSelectedLabels] = useState<string[]>(['Car']);
    const [comment, setComment] = useState('This is a preliminary scan observation.');

    // Zoom and Tool States
    const [zoom, setZoom] = useState(1);
    const [tool, setTool] = useState<'pan' | 'box' | 'polygon'>('pan');
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentShape, setCurrentShape] = useState<any>(null);
    const [shapes, setShapes] = useState<any[]>([]);

    const currentItem = MOCK_DATA_ITEMS[currentIndex];
    const totalItems = MOCK_DATA_ITEMS.length;

    // Reset zoom and tools when changing image
    useEffect(() => {
        setZoom(1);
        setShapes([]);
        setIsDrawing(false);
        setCurrentShape(null);
    }, [currentIndex]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleZoomReset = () => setZoom(1);

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (tool === 'pan') return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        if (tool === 'polygon') {
            if (!isDrawing) {
                setIsDrawing(true);
                setCurrentShape({ type: 'polygon', points: [[x, y]] });
            } else {
                // Add more points
                setCurrentShape({ ...currentShape, points: [...currentShape.points, [x, y]] });
            }
            return;
        }

        setIsDrawing(true);
        if (tool === 'box') {
            setCurrentShape({ type: 'bounding_box', x, y, width: 0, height: 0, startX: x, startY: y });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isDrawing || !currentShape) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;

        if (tool === 'box') {
            setCurrentShape({
                ...currentShape,
                x: Math.min(x, currentShape.startX),
                y: Math.min(y, currentShape.startY),
                width: Math.abs(x - currentShape.startX),
                height: Math.abs(y - currentShape.startY)
            });
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing || tool === 'polygon') return;
        setIsDrawing(false);
        if (currentShape) {
            setShapes([...shapes, currentShape]);
            setCurrentShape(null);
        }
    };

    // Close polygon or handle double click simulation
    const finishPolygon = () => {
        if (tool === 'polygon' && currentShape) {
            setShapes([...shapes, currentShape]);
            setCurrentShape(null);
            setIsDrawing(false);
        }
    };

    const handleNext = () => {
        if (currentIndex < totalItems - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Loop back or show completion
            setCurrentIndex(0);
        }
    };

    const toggleLabel = (label: string) => {
        setSelectedLabels(prev =>
            prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
        );
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-[#0f0e17]">
            {/* Top Navigation / Breadcrumb */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#16161a]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    </button>
                    <div className="h-4 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Assignment</span>
                        <h2 className="text-sm font-bold text-white tracking-tight">Image Classification - Batch A</h2>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Task ID</span>
                        <span className="text-xs font-mono text-gray-300">{taskId}</span>
                    </div>
                    <button className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-violet-900/20 transition-all">
                        Submit Task
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left: Image Viewer */}
                <div className="flex-1 relative bg-black/40 flex items-center justify-center p-8 group overflow-hidden">
                    <div
                        className="relative shadow-2xl rounded-lg border border-white/5 transition-transform duration-200 ease-out"
                        style={{ transform: `scale(${zoom})` }}
                    >
                        <img
                            src={currentItem.url}
                            alt={currentItem.filename}
                            className="max-w-full max-h-[70vh] object-contain select-none pointer-events-none"
                        />

                        {/* Annotation Layer */}
                        <svg
                            className="absolute inset-0 w-full h-full cursor-crosshair"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onDoubleClick={finishPolygon}
                        >
                            {/* Existing Shapes */}
                            {shapes.map((shape, i) => (
                                <g key={i}>
                                    {shape.type === 'bounding_box' ? (
                                        <rect
                                            x={shape.x}
                                            y={shape.y}
                                            width={shape.width}
                                            height={shape.height}
                                            fill="rgba(139, 92, 246, 0.2)"
                                            stroke="#8b5cf6"
                                            strokeWidth={2 / zoom}
                                        />
                                    ) : (
                                        <polyline
                                            points={shape.points.map((p: any) => p.join(',')).join(' ')}
                                            fill="rgba(244, 63, 94, 0.2)"
                                            stroke="#f43f5e"
                                            strokeWidth={2 / zoom}
                                        />
                                    )}
                                </g>
                            ))}
                            {/* Current Shape */}
                            {currentShape && (
                                <g>
                                    {currentShape.type === 'bounding_box' ? (
                                        <rect
                                            x={currentShape.x}
                                            y={currentShape.y}
                                            width={currentShape.width}
                                            height={currentShape.height}
                                            fill="rgba(139, 92, 246, 0.4)"
                                            stroke="#8b5cf6"
                                            strokeWidth={2 / zoom}
                                        />
                                    ) : (
                                        <polyline
                                            points={currentShape.points.map((p: any) => p.join(',')).join(' ')}
                                            fill="rgba(244, 63, 94, 0.4)"
                                            stroke="#f43f5e"
                                            strokeWidth={2 / zoom}
                                        />
                                    )}
                                </g>
                            )}
                        </svg>

                        {/* Tools Overlay */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/80 backdrop-blur-md rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 lg:scale-100">
                            <ToolbarButton icon="pan_tool" active={tool === 'pan'} onClick={() => setTool('pan')} />
                            <ToolbarButton icon="zoom_in" onClick={handleZoomIn} />
                            <ToolbarButton icon="zoom_out" onClick={handleZoomOut} />
                            <ToolbarButton icon="restart_alt" onClick={handleZoomReset} />
                            <div className="w-[1px] h-4 bg-white/20 mx-1" />
                            <ToolbarButton icon="crop_free" active={tool === 'box'} onClick={() => setTool('box')} />
                            <ToolbarButton icon="polyline" active={tool === 'polygon'} onClick={() => setTool('polygon')} />
                            <div className="w-[1px] h-4 bg-white/20 mx-1" />
                            <ToolbarButton icon="undo" onClick={() => setShapes(shapes.slice(0, -1))} />
                            <ToolbarButton icon="delete" onClick={() => setShapes([])} />
                        </div>
                    </div>

                    {/* Zoom Indicator */}
                    <div className="absolute top-6 right-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-gray-400">zoom_in</span>
                        <span className="text-xs font-mono text-gray-300">{(zoom * 100).toFixed(0)}%</span>
                    </div>

                    {/* Image Filename Overlay */}
                    <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <span className="text-xs font-mono text-gray-300">{currentItem.filename}</span>
                    </div>

                    {/* Pagination Indicator */}
                    <div className="absolute bottom-6 left-6 text-sm font-mono text-gray-500">
                        <span className="text-white font-bold">{currentIndex + 1}</span> / {totalItems}
                    </div>
                </div>

                {/* Right: Annotation Sidebar */}
                <div className="w-[380px] border-l border-white/5 bg-[#16161a] flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="p-6 flex flex-col gap-8">

                        {/* Labels Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-violet-400">label</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Labels</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_LABELS.map(label => (
                                    <button
                                        key={label}
                                        onClick={() => toggleLabel(label)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                            ${selectedLabels.includes(label)
                                                ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                                                : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:text-gray-300'}
                                        `}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-amber-400">chat_bubble</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Comment</span>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full h-24 bg-white/5 rounded-xl border border-white/10 p-4 text-sm text-gray-300 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                                placeholder="Add a comment about this data item..."
                            />
                        </div>

                        {/* Version Info */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-emerald-400">history</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Version</span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                                <span className="text-sm font-bold text-gray-300">Version 1</span>
                                <span className="text-[10px] font-mono text-gray-500 italic">Latest</span>
                            </div>
                        </div>

                        {/* Geometry Section */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-blue-400">poly</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Geometry</span>
                            </div>
                            <div className="bg-black/40 rounded-xl border border-white/5 p-4 overflow-hidden">
                                <pre className="text-[10px] font-mono text-blue-300 whitespace-pre-wrap leading-relaxed">
                                    {JSON.stringify({
                                        currentSession: shapes,
                                        original: currentItem.geometry
                                    }, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-auto p-6 bg-black/20 border-t border-white/5 flex gap-3">
                        <button className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-gray-300 hover:bg-white/10 transition-all">
                            Save
                        </button>
                        <button
                            onClick={handleNext}
                            className="flex-[1.5] px-4 py-3 rounded-xl bg-violet-600 text-sm font-bold text-white hover:bg-violet-500 shadow-lg shadow-violet-900/20 transition-all flex items-center justify-center gap-2"
                        >
                            <span>Next image</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToolbarButton({ icon, active = false, onClick }: { icon: string, active?: boolean, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                p-2 rounded-lg transition-all
                ${active ? 'bg-violet-600 text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/10'}
            `}
        >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </button>
    );
}
