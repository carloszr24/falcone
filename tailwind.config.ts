import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
        brand: ['var(--font-display)', 'Georgia', 'serif'],
      },
      colors: {
        stone: {
          950: '#0c0a09',
        },
        ink: '#14212b',
        sand: {
          50: '#f7f4ef',
          100: '#efe9e0',
          200: '#e2d8ca',
        },
        brand: {
          // Atlantic teal — Tarifa coastal (aliases keep burgundy/red class names working)
          teal: '#0c5c6e',
          'teal-light': '#1a7a8f',
          'teal-dark': '#084554',
          burgundy: '#0c5c6e',
          'burgundy-light': '#1a7a8f',
          'burgundy-dark': '#084554',
          red: '#0c5c6e',
          'red-light': '#1a7a8f',
          'red-dark': '#084554',
          white: '#FFFFFF',
          accent: '#c45c26',
        },
        gold: {
          DEFAULT: '#0c5c6e',
          light: '#1a7a8f',
          dark: '#084554',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(12, 92, 110, 0.28)',
        lift: '0 18px 50px -18px rgba(20, 33, 43, 0.35)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        skeleton: 'skeleton 1.5s ease-in-out infinite',
        scroll: 'scroll 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        skeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        scroll: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(200%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
