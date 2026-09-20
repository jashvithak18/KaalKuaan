/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        parchment: '#F3F0E8',
        'parchment-surface': '#FAF8F2',
        'parchment-dark': '#E9E4D6',
        carbon: '#20251F',
        'carbon-muted': '#3F443E',
        earth: '#6F624E',
        'earth-light': '#938670',
        'muted-green': '#68775E',
        'safety-amber': '#D59B35',
        'safety-amber-light': '#FCEECE',
        'warning-red': '#B84A3A',
        'warning-red-light': '#F8E6E4',
        'deep-red': '#7E302A',
        'map-green': '#7E916F',
        'survey-blue': '#71889A',
        terracotta: {
          50: '#FDF6F3',
          100: '#FBE9E4',
          200: '#F6D2C8',
          300: '#EEAF9F',
          400: '#E17F67',
          500: '#D35738',
          600: '#B84A3A',
          700: '#94382B',
          800: '#7E302A',
          900: '#642822'
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(32, 37, 31, 0.08)',
        'card': '0 2px 8px rgba(32, 37, 31, 0.06)',
        'panel': '0 4px 20px rgba(32, 37, 31, 0.10)',
      }
    },
  },
  plugins: [],
}
