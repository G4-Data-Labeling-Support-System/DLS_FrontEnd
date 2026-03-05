import { themeClasses } from "@/styles";
import { Link } from "react-router-dom";

export default function Hero() {
    return (
        <div className="relative ">
            <video
                autoPlay
                muted
                loop
                className="rotate-180 absolute top-[-340px]  h-full w-full left-0 z-[1] object-cover "
            >
                <source src="/blackhole.webm" type="video/webm" />
            </video>

            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-10">
                <div className={`${themeClasses.layouts.container} relative z-10 text-center`}>
                    {/* Holographic Brain Visualization */}
                    <div className="relative w-full max-w-2xl mx-auto mb-16 aspect-square flex items-center justify-center">

                        <div className="mt-52">
                            <h1 className="font-space text-6xl lg:text-9xl font-bold leading-[0.9] tracking-tighter mb-8\ max-w-4xl mx-auto">
                                Redefining <br />
                                <span className={themeClasses.text.gradient}>AI Precision</span>
                            </h1>
                            <p className={`text-lg ${themeClasses.text.secondary} mb-12 max-w-2xl mx-auto font-light tracking-wide leading-relaxed`}>
                                The next evolution of data annotation. Immersive architectures
                                designed for quantum-level quality control and global scalability.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Link
                                    to="/login"
                                    className="px-16 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full font-bold text-xl tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:shadow-[0_0_60px_rgba(217,70,239,0.8)] transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-violet-500 hover:to-fuchsia-500 text-white uppercase animate-[pulse_3s_ease-in-out_infinite]"
                                >
                                    Get started !
                                </Link>
                            </div>
                        </div>
                        x

                        {/* Floating Cards */}
                        <div className={`absolute top-40 right-0 ${themeClasses.cards.glass} border-l-2 border-violet-500 flex items-center gap-3 scale-90 translate-x-12 -translate-y-1`}>
                            <span className={`material-symbols-outlined ${themeClasses.text.violet}`}>
                                neurology
                            </span>
                            <div className="text-left">
                                <p className={`text-[8px] uppercase tracking-widest ${themeClasses.text.muted}`}>
                                    Processing
                                </p>
                                <p className="text-xs font-bold text-violet-300">Neural Sync</p>
                            </div>
                        </div>
                        <div className={`absolute bottom-0 -left-12 ${themeClasses.cards.glass} border-l-2 border-fuchsia-500 flex items-center gap-3 scale-90 -translate-x-12`}>
                            <span className={`material-symbols-outlined ${themeClasses.text.fuchsia}`}>
                                precision_manufacturing
                            </span>
                            <div className="text-left">
                                <p className={`text-[8px] uppercase tracking-widest ${themeClasses.text.muted}`}>
                                    Verification
                                </p>
                                <p className="text-xs font-bold text-fuchsia-300">99.9% Pure</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
};
