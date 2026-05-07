import { Link } from 'react-router-dom'


export default function Hero() {
  return (
    <section className="flex flex-col lg:flex-row items-center justify-between w-full gap-12 mt-10">
      {/* Left Content */}
      <div className="w-full lg:w-1/2 flex flex-col items-start text-left z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] text-white text-xs font-bold tracking-wider mb-8">
          <span className="text-red-500">//</span>
          READY FOR PROJECTS
          <span className="text-red-500">//</span>
        </div>
        
        <h1 className="text-6xl md:text-7xl lg:text-[70px] font-bold leading-[1.05] tracking-tight text-[#111] mb-6">
          Redefining <br /> AI precision, with <span className="text-[#888]">Annotationary</span>
        </h1>
        
        <p className="text-xl text-[#555] mb-10 font-medium">
          The next evolution of data annotation.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/price" className="px-6 py-3.5 bg-[#111]! text-white! rounded-full font-semibold text-lg flex items-center gap-3 hover:bg-gray-800 transition-transform! hover:scale-105 active:scale-95 shadow-xl">
            See Pricing
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>

          <Link
            to="/login"
            className="px-6 py-3.5 bg-[#e5e5e5]! text-[#111]! rounded-full font-semibold text-lg flex items-center gap-3 hover:bg-[#d5d5d5] transition-transform! hover:scale-105 active:scale-95"
          >
            Get started
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        </div>
      </div>

      {/* Right Grid / Masonry */}
      <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4 lg:gap-6 relative perspective-1000">
        <div className="flex flex-col gap-4 lg:gap-6 animate-float">
          {/* Top Left Image */}
          <div className="rounded-3xl overflow-hidden shadow-2xl transform transition-transform hover:-translate-y-2 hover:shadow-3xl duration-500 ease-out">
            <img src="/formix/poster_mockup_1777871044361.png" alt="Branding Paper" className="w-full h-[380px] object-cover" />
          </div>
          {/* Bottom Left Image (Box) */}
          <div className="rounded-3xl overflow-hidden shadow-2xl transform transition-transform hover:-translate-y-2 hover:shadow-3xl duration-500 ease-out">
            <img src="/formix/box_mockup_1777871271242.png" alt="Box Mockup" className="w-full h-[280px] object-cover" />
          </div>
        </div>
        
        <div className="flex flex-col gap-4 lg:gap-6 animate-float-delayed">
          {/* Top Right Image (Macbook) */}
          <div className="rounded-3xl overflow-hidden shadow-2xl transform transition-transform hover:-translate-y-2 hover:shadow-3xl duration-500 ease-out">
            <img src="/formix/macbook_mockup_1777871225581.png" alt="Macbook Pro" className="w-full h-[280px] object-cover" />
          </div>
          {/* Bottom Right Image (iPhone) */}
          <div className="rounded-3xl overflow-hidden shadow-2xl transform transition-transform hover:-translate-y-2 hover:shadow-3xl duration-500 ease-out">
            <img src="/formix/iphone_mockup_1777871095631.png" alt="iPhone 16" className="w-full h-[380px] object-cover" />
          </div>
        </div>
        
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-gradient-to-tr from-gray-200 to-transparent rounded-full blur-[100px] -z-10 mix-blend-multiply opacity-50"></div>
      </div>
    </section>
  )
}
