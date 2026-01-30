# DLSS Theme System

Centralized theme configuration extracted from HomePage, LoginPage, AdminDashboard, and UserManagement pages.

## 📁 File Structure

```
src/styles/
├── theme.ts          # Core theme configuration (colors, gradients, shadows, etc.)
├── themeClasses.ts   # Pre-built className utilities
└── index.ts          # Exports
```

## 🎨 Theme Configuration (`theme.ts`)

### Colors
- **Primary**: Violet (#8b5cf6), Fuchsia (#d946ef), Blue (#3b82f6)
- **Background**: Deep Dark (#0f0e17), Dark (#151118), Card (#1e1b29)
- **Status**: Success, Warning, Error, Info
- **Text**: Primary (white), Secondary, Tertiary, Muted

### Gradients
- `primary`: Violet to Fuchsia (horizontal)
- `hologram`: Purple to Pink
- `radialViolet`: Radial gradient for backgrounds

### Glass Effects
- `glass.card`: Transparent card with blur
- `glass.panel`: Modal/panel glass effect
- `glass.input`: Input field glass effect

## 🚀 Usage Examples

### 1. Import Theme Values

```tsx
import { colors, gradients, shadows } from '@/styles';

// Use in inline styles
<div style={{ background: colors.background.deepDark }}>
  <h1 style={{ color: colors.primary.violet }}>Title</h1>
</div>
```

### 2. Use Pre-built Classes

```tsx
import { themeClasses, commonPatterns } from '@/styles';

// Backgrounds
<div className={themeClasses.backgrounds.deepDark}>

// Text
<h1 className={themeClasses.text.gradient}>Gradient Text</h1>

// Buttons
<button className={themeClasses.buttons.primary}>
  Click Me
</button>

// Cards
<div className={themeClasses.cards.glass}>
  Glass Card Content
</div>
```

### 3. Use Common Patterns

```tsx
import { commonPatterns } from '@/styles';

// Logo
<div className={commonPatterns.logo.container}>
  <span className={commonPatterns.logo.icon}>polyline</span>
  <span className={commonPatterns.logo.text}>DLSS</span>
</div>

// Navigation Item
<Link 
  className={`${commonPatterns.nav.item} ${
    isActive ? commonPatterns.nav.itemActive : commonPatterns.nav.itemInactive
  }`}
>
  Menu Item
</Link>
```

### 4. Complete Component Example

```tsx
import { themeClasses, commonPatterns } from '@/styles';

export default function MyPage() {
  return (
    <div className={themeClasses.backgrounds.deepDark}>
      {/* Logo */}
      <div className={commonPatterns.logo.container}>
        <span className={commonPatterns.logo.icon}>polyline</span>
        <span className={commonPatterns.logo.text}>DLSS</span>
      </div>

      {/* Glass Card */}
      <div className={themeClasses.cards.glass}>
        <h2 className={themeClasses.text.gradient}>
          Beautiful Gradient Title
        </h2>
        <p className={themeClasses.text.secondary}>
          Secondary text content
        </p>
        <button className={themeClasses.buttons.primary}>
          Primary Action
        </button>
      </div>
    </div>
  );
}
```

## 📦 Available Utilities

### Background Classes
- `deepDark`, `dark`, `card`, `blackAlpha`, `whiteAlpha5`, `violetAlpha10`, etc.

### Text Classes
- `primary`, `secondary`, `tertiary`, `muted`, `violet`, `fuchsia`, `gradient`

### Button Classes
- `primary`: Gradient button with glow
- `secondary`: Ghost button with border
- `ghost`: Transparent hover button

### Card Classes
- `glass`: Glass card effect
- `glassPanel`: Modal/panel glass
- `admin`: Admin panel card

### Input Classes
- `glass`: Glass input field
- `neon`: Neon border focus input

## 🎯 Benefits

1. **Consistency**: All pages use the same color palette
2. **Maintainability**: Change theme in one place
3. **Type Safety**: TypeScript autocomplete for theme values
4. **Reusability**: Pre-built classes for common patterns
5. **Performance**: No runtime CSS-in-JS overhead

## 🔧 Customization

To modify the theme, edit `src/styles/theme.ts`:

```typescript
export const theme = {
  colors: {
    primary: {
      violet: '#YOUR_COLOR', // Change primary color
    },
  },
  // ... rest of theme
};
```

## 📝 Notes

- All colors extracted from existing pages
- Glass effects use backdrop-filter (may need fallbacks for older browsers)
- Gradients optimized for modern displays
- Shadows designed for dark backgrounds
