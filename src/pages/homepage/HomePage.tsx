import { themeClasses } from '@/styles';
import { BrandLogo } from '@/components/common/BrandLogo';
import Navbar from '@/components/layout/homepage/Navbar';
import Hero from '@/components/layout/homepage/Hero';
import Features from '@/components/layout/homepage/Features';

export default function HomePage() {
  return (
    <div className={`bg-[#030014] overflow-y-scroll overflow-x-hidden`}>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />

      {/* Footer */}
      <footer className={`py-20 border-t ${themeClasses.borders.violet10} relative overflow-hidden`}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-600/5 blur-[120px] rounded-full"></div>
        <div className={themeClasses.layouts.container}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <BrandLogo />
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
