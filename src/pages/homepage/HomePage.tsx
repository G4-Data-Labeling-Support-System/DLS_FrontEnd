import { Hero, Navbar, Services } from '@/features/landing-page'


export default function HomePage() {
  return (
    <div className="overflow-x-hidden font-sans selection:bg-black selection:text-[#111]">
      <Navbar />
      <div className="pt-24 pb-12 px-6 md:px-12 max-w-[1400px] mx-auto">
        <Hero />
        <Services />
      </div>
    </div>
  )
}

