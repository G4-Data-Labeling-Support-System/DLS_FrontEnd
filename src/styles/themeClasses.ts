/**
 * Theme Utility Classes
 * Pre-built className strings for common theme patterns
 * Import and use these in your components for consistent styling
 */

export const themeClasses = {
  // Background Classes
  backgrounds: {
    deepDark: 'bg-[#0f0e17]',
    dark: 'bg-[#151118]',
    card: 'bg-[#1e1b29]',
    blackAlpha: 'bg-black/40',
    whiteAlpha5: 'bg-white/5',
    violetAlpha5: 'bg-violet-500/5',
    violetAlpha10: 'bg-violet-500/10',
    violetAlpha20: 'bg-violet-500/20'
  },

  // Gradients
  gradients: {
    radialViolet:
      'bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.15)_0%,_rgba(15,14,23,1)_70%)]'
  },

  // Text Classes
  text: {
    primary: 'text-white',
    secondary: 'text-gray-400',
    tertiary: 'text-gray-500',
    muted: 'text-gray-600',
    violet: 'text-violet-400',
    fuchsia: 'text-fuchsia-400',
    gradient: 'bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#d946ef]'
  },

  // Border Classes
  borders: {
    violet10: 'border-violet-500/10',
    violet20: 'border-violet-500/20',
    violet30: 'border-violet-500/30',
    violet40: 'border-violet-500/40',
    white5: 'border-white/5',
    white10: 'border-white/10'
  },

  // Button Classes
  buttons: {
    primary:
      'px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg text-white font-medium shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all duration-300',
    secondary:
      'px-4 py-2 bg-white/5 border border-violet-500/20 rounded-lg text-gray-300 hover:text-white hover:bg-violet-500/10 hover:border-violet-500/40 transition-all duration-300',
    ghost:
      'px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300'
  },

  // Card Classes
  cards: {
    glass: 'glass-card rounded-xl p-6',
    glassPanel: 'glass-panel rounded-xl p-8',
    admin: 'bg-[#1e1b29] border border-white/5 rounded-xl p-6'
  },

  // Input Classes
  inputs: {
    glass:
      'glass-input rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:ring-0 focus:outline-none',
    neon: 'w-full h-14 bg-white/5 border border-white/10 rounded-lg px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-0 neon-border-focus transition-all duration-300'
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
    gridMesh: 'grid-mesh opacity-20',
    hologramGlow: 'shadow-[0_0_30px_rgba(139,92,246,0.4)]',
    glowViolet: 'drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]'
  }
} as const

// Commonly used combined classes
export const commonPatterns = {
  // Logo
  logo: {
    container: 'flex items-center gap-3',
    icon: 'material-symbols-outlined text-4xl text-violet-500 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]',
    text: 'font-space font-bold text-2xl tracking-tighter',
    version: 'text-xs font-mono text-violet-400 align-top opacity-70 ml-1'
  },

  // Navigation
  nav: {
    item: 'flex items-center gap-3 px-4 py-3 rounded-lg transition-all',
    itemActive: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
    itemInactive: 'text-gray-400 hover:bg-white/5 hover:text-white'
  },

  // Modal
  modal: {
    overlay: 'fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4',
    container: 'glass-panel w-full max-w-[560px] rounded-xl overflow-hidden flex flex-col relative',
    header: 'px-8 pt-10 pb-6',
    title: 'text-white text-3xl font-bold tracking-tight',
    subtitle: 'text-white/50 text-sm mt-2'
  }
} as const

export default themeClasses
