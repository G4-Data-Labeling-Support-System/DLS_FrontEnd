import { Link } from 'react-router-dom';
import { themeClasses, commonPatterns } from '@/styles';
import { DeploymentUnitOutlined, GlobalOutlined, SecurityScanOutlined, ArrowRightOutlined } from '@ant-design/icons';

export default function HomePage() {
  return (
    <div className={`relative min-h-screen ${themeClasses.backgrounds.deepDark} ${themeClasses.text.primary} font-sans overflow-x-hidden selection:bg-violet-500/30`}>

      {/* Navigation */}
      <nav className="absolute top-10 left-0 w-full z-50 px-10">
        <div className={themeClasses.layouts.container}>
          <div className={commonPatterns.logo.container}>
            <span className={commonPatterns.logo.icon}>
              polyline
            </span>
            <span className={commonPatterns.logo.text}>
              DLSS
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.1)_0%,_rgba(15,14,23,1)_70%)]"></div>
          <div className={`absolute inset-0 ${themeClasses.effects.gridMesh}`}></div>
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-violet-500 rounded-full blur-[2px] animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-fuchsia-500 rounded-full blur-[3px] animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full blur-[1px]"></div>
          <div className="absolute top-2/3 right-1/3 w-2.5 h-2.5 bg-violet-400 rounded-full blur-[2px]"></div>
        </div>

        <div className={`${themeClasses.layouts.container} relative z-10 text-center`}>
          {/* Holographic Brain Visualization */}
          <div className="relative w-full max-w-2xl mx-auto mb-16 aspect-square flex items-center justify-center">
            <div className={`absolute inset-0 border ${themeClasses.borders.violet20} rounded-full scale-110`}></div>
            <div className="absolute inset-0 border border-fuchsia-500/10 rounded-full scale-125 animate-[spin_20s_linear_infinite]"></div>
            <div className={`relative z-20 w-3/4 aspect-square overflow-hidden rounded-full border ${themeClasses.borders.violet40} p-1 ${themeClasses.backgrounds.blackAlpha} backdrop-blur-sm group shadow-[0_0_100px_rgba(139,92,246,0.2)]`}>
              <div className="absolute inset-0 bg-gradient-to-b from-violet-500/20 via-transparent to-fuchsia-500/20 z-10 pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-[2px] bg-violet-400 shadow-[0_0_15px_rgba(139,92,246,1)] z-30 animate-[bounce_4s_ease-in-out_infinite]"></div>
              <img
                alt="Digital Brain Scanned"
                className="w-full h-full object-cover grayscale opacity-60 mix-blend-screen transition-transform duration-1000 group-hover:scale-110"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_EaB7RHFbnMAxm5qhXoXa1OjP7NyHWv_hML9QE4y-bo7kUG49benz-Vw0MkTcVgmcX4lJ2-XXVVJoFTq5RfYwZR4hVi-lwf0_BPA2ZtyZRLJ3yaw6lygzB64gYPGuc8tGbPERP-_xwtdyQVTNrK0NKWhoPanC5mfnyfyxsA1VhLu4qgBScI5J0CfDakEBgTXB0YpjFj8aFKD8iBK7pRUugOKcBplm1UkcToLFhM5TLe5OS01TQqPXSBDpl2VS1E5lNyGOz0U2Ln2v"
              />
            </div>

            {/* Floating Cards */}
            <div className={`absolute top-0 right-0 ${themeClasses.cards.glass} border-l-2 border-violet-500 flex items-center gap-3 scale-90 translate-x-12 -translate-y-4`}>
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
            <div className={`absolute bottom-10 left-0 ${themeClasses.cards.glass} border-l-2 border-fuchsia-500 flex items-center gap-3 scale-90 -translate-x-12`}>
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

          <h1 className="font-space text-6xl lg:text-9xl font-bold leading-[0.9] tracking-tighter mb-8 max-w-4xl mx-auto">
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
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`${themeClasses.layouts.section} ${themeClasses.backgrounds.blackAlpha}`}>
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

      {/* Footer */}
      <footer className={`py-20 border-t ${themeClasses.borders.violet10} relative overflow-hidden`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full"></div>
        <div className={themeClasses.layouts.container}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className={commonPatterns.logo.container}>
              <span className="material-symbols-outlined text-3xl text-violet-500">
                polyline
              </span>
              <span className="font-space font-bold text-xl uppercase tracking-widest">
                DLSS v2.4
              </span>
            </div>
            <div className={`flex gap-12 text-sm font-medium ${themeClasses.text.muted}`}>
              <a
                className="hover:text-violet-400 transition-colors uppercase tracking-tighter"
                href="#"
              >
                Architecture
              </a>
              <a
                className="hover:text-violet-400 transition-colors uppercase tracking-tighter"
                href="#"
              >
                Security
              </a>
              <a
                className="hover:text-violet-400 transition-colors uppercase tracking-tighter"
                href="#"
              >
                Documentation
              </a>
            </div>
            <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
              © 2024 DATA-LABELING-SUPPORT-SYSTEM. ALL RIGHTS RESERVED.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
