import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wave: {
          deep:  '#080C14',
          dark:  '#0B0F1A',
          card:  '#111827',
          card2: '#0F1620',
          blue:  '#00C2FF',
          teal:  '#00E0B8',
          muted: '#8892A4',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-blue': '0 0 30px rgba(0,194,255,0.25)',
        'glow-teal': '0 0 30px rgba(0,224,184,0.2)',
        'glow-lg':   '0 0 60px rgba(0,194,255,0.15)',
        'card':      '0 4px 24px rgba(0,0,0,0.4)',
      },
      borderColor: {
        wave: 'rgba(0,194,255,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease both',
        'slide-up': 'slideUp 0.4s ease both',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
