import { themeClasses } from "@/styles";
import { useState } from "react";

export default function GuidelineSection({ guideline }: { guideline?: string }) {
    const [expanded, setExpanded] = useState(true);
    const lines = (guideline ?? "").split('\n');

    return (
        <div className={`${themeClasses.backgrounds.card} border ${themeClasses.borders.violet20} rounded-2xl overflow-hidden transition-all duration-300`}>
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