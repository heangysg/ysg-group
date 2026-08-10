/** @type {import('tailwindcss').Config} */ 

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#004691',
        'primary-dark': '#003366',
        'primary-light': '#005BB5',
        accent: '#004691',
        zinc: {
          850: '#18181b',
          900: '#09090b',
          950: '#030712',
        }
      },
      fontFamily: {
        sans: ['var(--font-kantumruy)', 'var(--font-oswald)', 'var(--font-inter)', 'sans-serif'],
        khmer: ['var(--font-kantumruy)', 'sans-serif'],
        heading: ['var(--font-oswald)', 'var(--font-kantumruy)', 'sans-serif'],
        condensed: ['var(--font-oswald)', 'var(--font-kantumruy)', 'sans-serif'],
      },
      boxShadow: {
        'lux': '0 4px 20px -4px rgba(0, 0, 0, 0.05)',
        'lux-deep': '0 20px 40px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.4)',
      }
    },
  },
  plugins: [],
}
