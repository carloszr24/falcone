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
        display: ['var(--font-body)', 'system-ui', 'sans-serif'],
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
          // Falcone corporate blue (aliases keep existing class names working)
          teal: '#103f91',
          'teal-light': '#2b63c6',
          'teal-dark': '#0a2d6a',
          burgundy: '#103f91',
          'burgundy-light': '#2b63c6',
          'burgundy-dark': '#0a2d6a',
          red: '#103f91',
          'red-light': '#2b63c6',
          'red-dark': '#0a2d6a',
          white: '#FFFFFF',
          accent: '#4f7fe0',
        },
        gold: {
          DEFAULT: '#103f91',
          light: '#2b63c6',
          dark: '#0a2d6a',
        },
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(16, 63, 145, 0.28)',
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
