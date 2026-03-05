import { themeClasses } from '@/styles';
import { DeploymentUnitOutlined, GlobalOutlined, SecurityScanOutlined, ArrowRightOutlined } from '@ant-design/icons';

export default function Features() {
    return (
        <section className={`${themeClasses.layouts.section} ${themeClasses.backgrounds.blackAlpha} z-30`}>
            <div className={themeClasses.layouts.container}>
                <div className={themeClasses.layouts.gridCols3}>
                    <div className={`${themeClasses.cards.glass} p-10 rounded-[2rem] flex flex-col items-start gap-6 group cursor-pointer`}>
                        <div className={`w-16 h-16 ${themeClasses.backgrounds.violetAlpha10} rounded-2xl flex items-center justify-center ${themeClasses.text.violet} border ${themeClasses.borders.violet20} group-hover:bg-violet-500 group-hover:text-white transition-all duration-500`}>
                            <DeploymentUnitOutlined className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="font-space text-2xl font-bold mb-4">
                                Automated AI Pipelines
                            </h3>
                            <p className={`${themeClasses.text.secondary} font-light leading-relaxed group-hover:text-gray-300 transition-colors`}>
                                Seamless end-to-end integration. Let our proprietary
                                algorithms pre-label data with hyper-precision before human
                                verification.
                            </p>
                        </div>
                        <div className={`mt-auto pt-8 flex items-center gap-2 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity`}>
                            Action <ArrowRightOutlined className="text-sm" />
                        </div>
                    </div>

                    <div className={`${themeClasses.cards.glass} p-10 rounded-[2rem] flex flex-col items-start gap-6 group cursor-pointer`}>
                        <div className={`w-16 h-16 bg-fuchsia-500/10 rounded-2xl flex items-center justify-center ${themeClasses.text.fuchsia} border border-fuchsia-500/20 group-hover:bg-fuchsia-500 group-hover:text-white transition-all duration-500`}>
                            <GlobalOutlined className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="font-space text-2xl font-bold mb-4">
                                Global Workforce Scale
                            </h3>
                            <p className={`${themeClasses.text.secondary} font-light leading-relaxed group-hover:text-gray-300 transition-colors`}>
                                Distribute tasks across a decentralized network of over 50,000
                                certified annotators worldwide, managed via smart consensus.
                            </p>
                        </div>
                        <div className={`mt-auto pt-8 flex items-center gap-2 ${themeClasses.text.fuchsia} font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity`}>
                            View Network{' '}
                            <span className="material-symbols-outlined text-sm">
                                arrow_forward
                            </span>
                        </div>
                    </div>

                    <div className={`${themeClasses.cards.glass} p-10 rounded-[2rem] flex flex-col items-start gap-6 group cursor-pointer`}>
                        <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                            <SecurityScanOutlined className="text-3xl" />
                        </div>
                        <div>
                            <h3 className="font-space text-2xl font-bold mb-4">
                                Quantum-Level Quality
                            </h3>
                            <p className={`${themeClasses.text.secondary} font-light leading-relaxed group-hover:text-gray-300 transition-colors`}>
                                Zero-error tolerance via triple-blind verification and
                                real-time biometric identity tracking for ultimate data
                                security.
                            </p>
                        </div>
                        <div className="mt-auto pt-8 flex items-center gap-2 text-blue-400 font-bold text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                            Audit Protocol{' '}
                            <span className="material-symbols-outlined text-sm">
                                arrow_forward
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
};
