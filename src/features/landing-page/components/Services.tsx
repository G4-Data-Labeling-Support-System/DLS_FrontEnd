import React from 'react'

const FolderIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
    <path d="M4 6C4 4.89543 4.89543 4 6 4H10.5C10.7652 4 11.0196 4.10536 11.2071 4.29289L13 6.08579C13.1875 6.27332 13.4419 6.37868 13.7071 6.37868H18C19.1046 6.37868 20 7.27411 20 8.37868V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6Z" fill="#111" />
  </svg>
)

const Tag = ({ text }: { text: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#e5e5e5] rounded-full text-[10px] font-bold tracking-wider text-[#555]">
    <span className="w-2 h-2 rounded-full bg-red-600"></span>
    {text}
  </div>
)

export default function Services() {
  return (
    <section className="mt-40 w-full">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111] text-white text-xs font-bold tracking-wider mb-6">
            <span className="text-red-500">//</span>
            SERVICES
            <span className="text-red-500">//</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-[#111]">
            What We Do.
          </h2>
        </div>
        <p className="text-[#555] text-lg max-w-sm text-right mt-6 md:mt-0 font-medium">
          We combine strategy, speed, and skill to deliver exceptional design — every time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-[#f8f8f8] border border-gray-200 rounded-[32px] p-8 flex flex-col h-[500px] overflow-hidden group hover:border-gray-300 transition-colors shadow-sm">
          <FolderIcon />
          <h3 className="text-2xl font-bold text-[#111] mb-3">Brand Identity</h3>
          <p className="text-[#555] mb-6 leading-relaxed">
            Elevate your identity: sharp positioning, cohesive visuals, real impact.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            <Tag text="ART DIRECTION" />
            <Tag text="BRAND STRATEGY" />
            <Tag text="LOGO DESIGN" />
            <Tag text="COLOR SYSTEMS" />
          </div>
          <div className="mt-auto -mx-8 -mb-8 h-48 overflow-hidden rounded-b-[32px]">
            <img 
              src="/formix/box_mockup_1777871271242.png" 
              alt="Brand Identity" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#f8f8f8] border border-gray-200 rounded-[32px] p-8 flex flex-col h-[500px] overflow-hidden group hover:border-gray-300 transition-colors shadow-sm">
          <FolderIcon />
          <h3 className="text-2xl font-bold text-[#111] mb-3">Web & Mobile Design</h3>
          <p className="text-[#555] mb-6 leading-relaxed">
            Refresh or rebrand your UI; lift retention with clear flows and micro-interactions.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            <Tag text="CLEAN & MODERN UI" />
            <Tag text="REBRANDING" />
            <Tag text="PROTOTYPING" />
            <Tag text="DESIGN SYSTEM" />
          </div>
          <div className="mt-auto -mx-8 -mb-8 h-48 overflow-hidden rounded-b-[32px]">
            <img 
              src="/formix/iphone_green_1777871313393.png" 
              alt="Web & Mobile Design" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#f8f8f8] border border-gray-200 rounded-[32px] p-8 flex flex-col h-[500px] overflow-hidden group hover:border-gray-300 transition-colors shadow-sm">
          <FolderIcon />
          <h3 className="text-2xl font-bold text-[#111] mb-3">No-Code Websites</h3>
          <p className="text-[#555] mb-6 leading-relaxed">
            Launch a revenue-driving site that captures qualified leads 24/7 — shipped in 14 days or less.
          </p>
          <div className="flex flex-wrap gap-2 mb-8">
            <Tag text="FRAMER DEV" />
            <Tag text="INTEGRATIONS" />
            <Tag text="CMS INTEGRATION" />
            <Tag text="ANIMATION" />
          </div>
          <div className="mt-auto -mx-8 -mb-8 h-48 overflow-hidden rounded-b-[32px]">
            <img 
              src="/formix/macbook_mockup_1777871225581.png" 
              alt="No-Code Websites" 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
