/**
 * Theme Utility Classes
 * Pre-built className strings for common theme patterns
 * Import and use these in your components for consistent styling
 */

export const themeClasses = {
  // Background Classes
  backgrounds: {
    deepDark: 'bg-[#f1f1f1]',
    dark: 'bg-[#ffffff]',
    card: 'bg-white',
    blackAlpha: 'bg-black/5',
    whiteAlpha5: 'bg-black/5',
    violetAlpha5: 'bg-gray-100',
    violetAlpha10: 'bg-gray-200',
    violetAlpha20: 'bg-gray-300'
  },

  // Gradients
  gradients: {
    radialViolet:
      'bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.05)_0%,_rgba(241,241,241,1)_70%)]'
  },

  // Text Classes
  text: {
    primary: 'text-[#111111]',
    secondary: 'text-[#555555]',
    tertiary: 'text-[#777777]',
    muted: 'text-[#888888]',
    violet: 'text-[#111111]',
    fuchsia: 'text-[#333333]',
    gradient: 'text-[#111111]'
  },

  // Border Classes
  borders: {
    violet10: 'border-gray-200',
    violet20: 'border-gray-300',
    violet30: 'border-gray-400',
    violet40: 'border-gray-500',
    white5: 'border-gray-100',
    white10: 'border-gray-200'
  },

  // Button Classes
  buttons: {
    primary:
      'px-4 py-2 bg-[#111111] rounded-lg text-white font-medium shadow-md hover:bg-gray-800 transition-all duration-300',
    secondary:
      'px-4 py-2 bg-white border border-gray-300 rounded-lg text-[#111111] hover:text-black hover:bg-gray-50 hover:border-gray-400 transition-all duration-300',
    ghost:
      'px-4 py-2 text-[#555555] hover:text-[#111111] hover:bg-gray-100 rounded-lg transition-all duration-300'
  },

  // Card Classes
  cards: {
    glass: 'bg-white/80 backdrop-blur-md rounded-xl p-6 border border-gray-200 shadow-sm',
    glassPanel: 'bg-white/90 backdrop-blur-md rounded-xl p-8 border border-gray-200 shadow-sm',
    admin: 'bg-white border border-gray-200 rounded-xl p-6 shadow-sm'
  },

  // Input Classes
  inputs: {
    glass:
      'bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-[#111111] placeholder-gray-400 focus:border-[#111111] focus:ring-0 focus:outline-none',
    neon: 'w-full h-14 bg-white border border-gray-300 rounded-lg px-4 text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#111111] transition-all duration-300'
  },

  // Layout Classes
  layouts: {
    container: 'max-w-[1440px] mx-auto px-6 lg:px-10',
    section: 'py-32 relative',
    flexCenter: 'flex items-center justify-center',
    gridCols3: 'grid lg:grid-cols-3 gap-8'
  },

  // Effect Classes
  effects: {
    gridMesh: 'opacity-5',
    hologramGlow: 'shadow-lg',
    glowViolet: 'shadow-md'
  }
} as const

// Commonly used combined classes
export const commonPatterns = {
  // Logo
  logo: {
    container: 'flex items-center gap-3',
    icon: 'material-symbols-outlined text-4xl text-[#111111]',
    text: 'font-sans font-bold text-2xl tracking-tighter text-[#111111]',
    version: 'text-xs font-mono text-[#555555] align-top opacity-70 ml-1'
  },

  // Navigation
  nav: {
    item: 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
    itemActive: 'bg-gray-100 text-[#111111] border border-gray-200 font-medium',
    itemInactive: 'text-[#555555] hover:bg-gray-50 hover:text-[#111111]'
  },

  // Modal
  modal: {
    overlay: 'fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4',
    container: 'bg-white w-full max-w-[560px] rounded-xl overflow-hidden flex flex-col relative shadow-2xl',
    header: 'px-8 pt-10 pb-6',
    title: 'text-[#111111] text-3xl font-bold tracking-tight',
    subtitle: 'text-[#555555] text-sm mt-2'
  }
} as const

export default themeClasses
