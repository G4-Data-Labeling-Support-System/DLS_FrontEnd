/**
 * DLSS Theme Configuration
 * Centralized theme colors and styles for consistent design across the application
 * Based on: HomePage, LoginPage, AdminDashboard, UserManagement
 */

export const theme = {
  // Primary Colors
  colors: {
    // Brand Colors
    primary: {
      violet: '#8b5cf6',
      fuchsia: '#d946ef',
      blue: '#3b82f6'
    },

    // Background Colors
    background: {
      deepDark: '#0f0e17',
      dark: '#151118',
      card: '#1e1b29',
      black: '#000000'
    },

    // Accent Colors
    accent: {
      violet: {
        50: 'rgba(139, 92, 246, 0.05)',
        100: 'rgba(139, 92, 246, 0.1)',
        200: 'rgba(139, 92, 246, 0.2)',
        300: 'rgba(139, 92, 246, 0.3)',
        400: 'rgba(139, 92, 246, 0.4)',
        500: 'rgba(139, 92, 246, 0.5)',
        600: 'rgba(139, 92, 246, 0.6)',
        800: 'rgba(139, 92, 246, 0.8)'
      },
      fuchsia: {
        50: 'rgba(217, 70, 239, 0.05)',
        100: 'rgba(217, 70, 239, 0.1)',
        200: 'rgba(217, 70, 239, 0.2)',
        300: 'rgba(217, 70, 239, 0.3)',
        500: 'rgba(217, 70, 239, 0.5)'
      }
    },

    // Status Colors
    status: {
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6'
    },

    // Text Colors
    text: {
      primary: '#ffffff',
      secondary: '#9ca3af',
      tertiary: '#6b7280',
      muted: '#4b5563'
    }
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(90deg, #8b5cf6 0%, #d946ef 100%)',
    primaryVertical: 'linear-gradient(180deg, #8b5cf6 0%, #d946ef 100%)',
    hologram: 'linear-gradient(135deg, #911DF3 0%, #FF0080 100%)',
    radialViolet:
      'radial-gradient(circle at center, rgba(139, 92, 246, 0.15) 0%, rgba(15, 14, 23, 1) 70%)',
    radialVioletLight:
      'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, rgba(15, 14, 23, 1) 70%)'
  },

  // Shadows
  shadows: {
    glow: {
      violet: '0 0 30px rgba(139, 92, 246, 0.4)',
      violetLight: '0 0 20px rgba(139, 92, 246, 0.3)',
      violetStrong: '0 0 60px rgba(217, 70, 239, 0.8)',
      fuchsia: '0 0 30px rgba(217, 70, 239, 0.6)'
    },
    card: '0 20px 50px rgba(139, 92, 246, 0.15)',
    panel: '0 0 40px rgba(137, 90, 246, 0.15)'
  },

  // Border Colors
  borders: {
    violet: {
      10: 'rgba(139, 92, 246, 0.1)',
      20: 'rgba(139, 92, 246, 0.2)',
      30: 'rgba(139, 92, 246, 0.3)',
      40: 'rgba(139, 92, 246, 0.4)',
      50: 'rgba(139, 92, 246, 0.5)'
    },
    white: {
      5: 'rgba(255, 255, 255, 0.05)',
      10: 'rgba(255, 255, 255, 0.1)',
      20: 'rgba(255, 255, 255, 0.2)'
    }
  },

  // Glass Effects
  glass: {
    card: {
      background: 'rgba(255, 255, 255, 0.02)',
      backdropFilter: 'blur(15px)',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    },
    panel: {
      background: 'rgba(15, 14, 23, 0.85)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(137, 90, 246, 0.3)'
    },
    input: {
      background: 'rgba(15, 14, 23, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }
  },

  // Typography
  fonts: {
    display: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace"
  },

  // Spacing (for consistent padding/margin)
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem' // 64px
  },

  // Border Radius
  borderRadius: {
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
    full: '9999px'
  },

  // Transitions
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const

// Utility function to get theme values
export const getThemeColor = (path: string) => {
  const keys = path.split('.')
  let value: any = theme

  for (const key of keys) {
    value = value[key]
    if (value === undefined) return undefined
  }

  return value
}

// Export individual sections for convenience
export const {
  colors,
  gradients,
  shadows,
  borders,
  glass,
  fonts,
  spacing,
  borderRadius,
  transitions
} = theme

export default theme
