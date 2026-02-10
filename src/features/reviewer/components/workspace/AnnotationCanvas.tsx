import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import {
    ZoomInOutlined,
    ZoomOutOutlined,
    DragOutlined,
    BorderOuterOutlined,
    EyeOutlined,
    EyeInvisibleOutlined
} from '@ant-design/icons';

interface Annotation {
    id: string;
    label: string;
    confidence: number;
    color: string;
    bbox: { x: number; y: number; w: number; h: number }; // Percentages 0-100
}

interface AnnotationCanvasProps {
    imageUrl: string;
    annotations: Annotation[];
}

export const AnnotationCanvas: React.FC<AnnotationCanvasProps> = ({ imageUrl, annotations }) => {
    const [zoom, setZoom] = useState(100);
    const [showLabels, setShowLabels] = useState(true);

    // Mock generic tools
    const tools = [
        { icon: <DragOutlined />, label: 'Pan', active: true },
        { icon: <BorderOuterOutlined />, label: 'Select' },
        { icon: <ZoomInOutlined />, label: 'Zoom In', action: () => setZoom(z => Math.min(z + 25, 300)) },
        { icon: <ZoomOutOutlined />, label: 'Zoom Out', action: () => setZoom(z => Math.max(z - 25, 50)) },
        { icon: showLabels ? <EyeOutlined /> : <EyeInvisibleOutlined />, label: 'Toggle Labels', action: () => setShowLabels(!showLabels) },
    ];

    return (
        <div className="flex-1 relative bg-[#0a0a0f] overflow-hidden flex flex-col items-center justify-center p-8">
            {/* Toolbar */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 bg-[#1a1924]/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 shadow-2xl">
                {tools.map((tool, idx) => (
                    <Tooltip key={idx} title={tool.label}>
                        <Button
                            type="text"
                            icon={tool.icon}
                            onClick={tool.action}
                            className={`
                                text-gray-400 hover:text-white hover:bg-white/10 border-none rounded-full w-10 h-10 flex items-center justify-center
                                ${tool.active ? 'bg-violet-500/20 text-violet-300' : ''}
                            `}
                        />
                    </Tooltip>
                ))}
            </div>

            {/* Canvas Area */}
            <div
                className="relative shadow-2xl transition-transform duration-200 ease-out"
                style={{
                    width: '80%',
                    aspectRatio: '16/9',
                    transform: `scale(${zoom / 100})`
                }}
            >
                <img
                    src={imageUrl}
                    alt="Canvas"
                    className="w-full h-full object-contain bg-[#15141e] rounded-lg"
                    draggable={false}
                />

                {/* Overlays */}
                {annotations.map(ann => (
                    <div
                        key={ann.id}
                        className="absolute border-2 transition-all hover:bg-white/5 cursor-pointer group"
                        style={{
                            left: `${ann.bbox.x}%`,
                            top: `${ann.bbox.y}%`,
                            width: `${ann.bbox.w}%`,
                            height: `${ann.bbox.h}%`,
                            borderColor: ann.color,
                            boxShadow: `0 0 20px ${ann.color}40`
                        }}
                    >
                        {/* Label Tag */}
                        {showLabels && (
                            <div
                                className="absolute -top-7 left-0 px-2 py-0.5 rounded text-[10px] font-bold text-white whitespace-nowrap flex items-center gap-2 shadow-sm"
                                style={{ backgroundColor: ann.color }}
                            >
                                <span>{ann.label}</span>
                                <span className="opacity-80 font-normal">{ann.confidence}%</span>
                            </div>
                        )}

                        {/* Resize Handles (Visual only) */}
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
};
