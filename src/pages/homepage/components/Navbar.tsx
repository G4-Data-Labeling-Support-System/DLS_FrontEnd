import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CloseOutlined } from '@ant-design/icons'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const menuItems = [
    { label: 'Home', href: '#' },
    { label: 'Services', href: '#' },
    { label: 'Benefits', href: '#' },
    { label: 'Work', href: '#' },
    { label: 'Pricing', href: '#' },
    { label: 'Reviews', href: '#' },
    { label: 'FAQs', href: '#' },
    { label: 'Contact', href: '#' }
  ]

  return (
    <div className="w-full h-20 fixed top-0 bg-[#f1f1f1]/80 backdrop-blur-md z-50 px-6 md:px-12 flex items-center justify-between">
      <div className="flex items-center">
        {/* Formix Logo Style */}
        <img src="/logo.svg" alt="Logo" className="w-8 h-8 mr-2" />
        <span className="text-2xl font-bold tracking-tighter text-[#111]">Annotationary</span>
      </div>

      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="px-5 py-2.5 bg-[#111] text-white rounded-full text-sm font-medium tracking-wide flex items-center gap-2 hover:bg-gray-800 transition-all active:scale-95 z-50"
        >
          Menu 
          {isMenuOpen ? (
            <CloseOutlined className="text-[10px]" />
          ) : (
            <span className="text-lg leading-none">+</span>
          )}
        </button>

        {/* Dropdown Menu */}
        <div 
          className={`absolute top-full right-0 mt-4 w-64 bg-[#111] rounded-2xl p-6 shadow-2xl transition-all duration-300 origin-top-right ${
            isMenuOpen 
              ? 'opacity-100 scale-100 visible' 
              : 'opacity-0 scale-95 invisible'
          }`}
        >
          <nav className="flex flex-col gap-4">
            {menuItems.map((item, index) => (
              <a 
                key={index}
                href={item.href}
                className="text-[#888] font-medium text-lg hover:text-white transition-colors block"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}

export default Navbar

