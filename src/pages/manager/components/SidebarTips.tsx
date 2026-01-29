
import React from 'react';

const tips = [
    {
        title: 'Project Name',
        description: 'Choose a descriptive name that clearly identifies the project purpose.',
        icon: 'label'
    },
    {
        title: 'Dataset',
        description: 'Ensure your dataset follows the required format (CSV, JSON) and structure.',
        icon: 'database'
    },
    {
        title: 'Guidelines',
        description: 'Providing clear guidelines helps labelers understand the task better.',
        icon: 'description'
    }
];

const SidebarTips: React.FC = () => {
    return (
        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-dlss-secondary">lightbulb</span>
                Creation Tips
            </h3>
            <div className="flex flex-col gap-3">
                {tips.map((tip, index) => (
                    <div key={index} className="p-4 rounded-xl bg-surface-dark/60 border border-glass-border/30 text-sm">
                        <p className="text-[#ad9cba] mb-1 text-xs uppercase tracking-wider font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">{tip.icon}</span> {tip.title}
                        </p>
                        <p className="text-white/90 text-sm leading-relaxed">{tip.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SidebarTips;
