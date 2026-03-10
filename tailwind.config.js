/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#9d27f1',
        secondary: '#d946ef',
        'background-dark': '#0f0e17',
        'surface-dark': '#1a1625',
        'header-dark': '#140e1d',
        'glass-border': 'rgba(157, 39, 241, 0.3)'
      }
    }
  },
  plugins: []
}
